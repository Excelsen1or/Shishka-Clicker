const DISCORD_CLIENT_ID =
  import.meta.env.VITE_CLIENT_ID ?? import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_ACTIVITY_SCOPES = ['identify', 'rpc.activities.write']
const DISCORD_READY_TIMEOUT_MS = 5000
const DISCORD_AUTHORIZE_TIMEOUT_MS = 10000
const DISCORD_AUTHENTICATE_TIMEOUT_MS = 10000
const DISCORD_TOKEN_EXCHANGE_TIMEOUT_MS = 10000

export function shouldLoadDiscordSdk({
  hasWindow = typeof window !== 'undefined',
  clientId = DISCORD_CLIENT_ID,
} = {}) {
  return hasWindow && Boolean(clientId)
}

function toDiscordError(stage, error) {
  const message = error instanceof Error ? error.message : 'unknown_error'
  return new Error(`${stage}: ${message}`)
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
      discordSdk.commands.authorize({
        client_id: DISCORD_CLIENT_ID,
        response_type: 'code',
        state: 'discord-activity',
        prompt: 'none',
        scope: DISCORD_ACTIVITY_SCOPES,
      }),
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

  await discordSdk.commands.setActivity({ activity }).catch((error) => {
    throw toDiscordError('discord_set_activity', error)
  })
  return true
}

export function getDiscordSdk() {
  return discordSdkInstance
}
