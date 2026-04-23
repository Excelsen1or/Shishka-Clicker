const DISCORD_CLIENT_ID =
  import.meta.env.VITE_CLIENT_ID ?? import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_ACTIVITY_SCOPES = ['identify', 'rpc.activities.write']
const DISCORD_READY_TIMEOUT_MS = 5000
const DISCORD_AUTHORIZE_TIMEOUT_MS = 10000
const DISCORD_AUTHENTICATE_TIMEOUT_MS = 10000
const DISCORD_TOKEN_EXCHANGE_TIMEOUT_MS = 10000
const DISCORD_SET_ACTIVITY_TIMEOUT_MS = 8000

export function shouldLoadDiscordSdk({
  hasWindow = typeof window !== 'undefined',
  clientId = DISCORD_CLIENT_ID,
} = {}) {
  return hasWindow && Boolean(clientId)
}

export function formatDiscordCommandError(error) {
  if (!error) {
    return 'unknown_error'
  }

  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error)

  const details = []

  if (typeof error === 'object' && error !== null) {
    if ('status' in error && error.status != null) {
      details.push(`status=${error.status}`)
    }

    if ('code' in error && error.code != null) {
      details.push(`code=${error.code}`)
    }

    if ('method' in error && 'path' in error && error.method && error.path) {
      details.push(`${error.method} ${error.path}`)
    }
  }

  return details.length > 0 ? `${message} [${details.join(', ')}]` : message
}

function toDiscordError(stage, error) {
  const message = formatDiscordCommandError(error)
  return new Error(`${stage}: ${message}`)
}

export function buildDiscordAuthorizeParams({ clientId = DISCORD_CLIENT_ID }) {
  return {
    client_id: clientId,
    response_type: 'code',
    state: 'discord-activity',
    prompt: 'none',
    scope: DISCORD_ACTIVITY_SCOPES,
  }
}

function withTimeout(promise, timeoutMs, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error(`${label}_timeout`))
      }, timeoutMs)

      Promise.resolve(promise).finally(() => {
        window.clearTimeout(timeoutId)
      })
    }),
  ])
}

let discordSdkPromise = null
let discordSdkInstance = null

async function loadDiscordSdk() {
  if (!shouldLoadDiscordSdk()) {
    return null
  }

  if (!discordSdkPromise) {
    discordSdkPromise = import('@discord/embedded-app-sdk')
      .then(({ DiscordSDK }) => {
        discordSdkInstance = new DiscordSDK(DISCORD_CLIENT_ID)
        return discordSdkInstance
      })
      .catch((error) => {
        discordSdkPromise = null
        discordSdkInstance = null
        console.warn('Not running inside Discord:', error)
        return null
      })
  }

  return discordSdkPromise
}

export async function setupDiscord() {
  const discordSdk = await loadDiscordSdk()
  if (!discordSdk) {
    return {
      mode: 'standalone',
      isActivity: false,
      discordSdk: null,
      auth: null,
      user: null,
    }
  }

  try {
    const [{ exchangeDiscordCode }] = await Promise.all([
      import('./lib/discordAuth.js'),
      withTimeout(
        discordSdk.ready(),
        DISCORD_READY_TIMEOUT_MS,
        'discord_ready',
      ),
    ]).catch((error) => {
      throw toDiscordError('discord_ready', error)
    })

    const { code } = await withTimeout(
      discordSdk.commands.authorize(
        buildDiscordAuthorizeParams({
          clientId: DISCORD_CLIENT_ID,
        }),
      ),
      DISCORD_AUTHORIZE_TIMEOUT_MS,
      'discord_authorize',
    ).catch((error) => {
      throw toDiscordError('discord_authorize', error)
    })

    const { access_token: accessToken } = await withTimeout(
      exchangeDiscordCode(code),
      DISCORD_TOKEN_EXCHANGE_TIMEOUT_MS,
      'discord_exchange_token',
    ).catch((error) => {
      throw toDiscordError('discord_exchange_token', error)
    })
    const auth = await withTimeout(
      discordSdk.commands.authenticate({
        access_token: accessToken,
      }),
      DISCORD_AUTHENTICATE_TIMEOUT_MS,
      'discord_authenticate',
    ).catch((error) => {
      throw toDiscordError('discord_authenticate', error)
    })

    if (!auth) {
      throw new Error('Authenticate command returned null')
    }

    return {
      mode: 'activity',
      isActivity: true,
      discordSdk,
      auth,
      user: auth.user ?? null,
    }
  } catch (error) {
    console.warn('Failed to initialize Discord activity:', error)
    return {
      mode: 'activity_error',
      isActivity: false,
      discordSdk,
      auth: null,
      user: null,
      error,
    }
  }
}

export async function setDiscordRichPresence(activity) {
  const discordSdk = await loadDiscordSdk()
  if (!discordSdk || !activity) {
    return false
  }

  await withTimeout(
    discordSdk.commands.setActivity({ activity }),
    DISCORD_SET_ACTIVITY_TIMEOUT_MS,
    'discord_set_activity',
  ).catch((error) => {
    throw toDiscordError('discord_set_activity', error)
  })
  return true
}

export function getDiscordSdk() {
  return discordSdkInstance
}
