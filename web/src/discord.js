import { DiscordSDK } from '@discord/embedded-app-sdk'
import { exchangeDiscordCode } from './lib/discordAuth.js'

const DISCORD_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_ACTIVITY_SCOPES = ['identify', 'rpc.activities.write']
const DISCORD_READY_TIMEOUT_MS = 5000
const DISCORD_AUTHORIZE_TIMEOUT_MS = 10000
const DISCORD_AUTHENTICATE_TIMEOUT_MS = 10000
const DISCORD_TOKEN_EXCHANGE_TIMEOUT_MS = 10000

function isDiscordEmbeddedContext() {
  if (typeof window === 'undefined') {
    return false
  }

  const params = new URLSearchParams(window.location.search)
  if (params.has('frame_id') || params.has('instance_id') || params.has('referrer_id')) {
    return true
  }

  const referrer = document.referrer ?? ''
  if (/discord(app)?\.com|discordsays\.com/i.test(referrer)) {
    return true
  }

  try {
    return window.parent !== window || Boolean(window.opener)
  } catch {
    return true
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

function createDiscordSdk() {
  if (typeof window === 'undefined' || !DISCORD_CLIENT_ID) {
    return null
  }

  try {
    return new DiscordSDK(DISCORD_CLIENT_ID)
  } catch (error) {
    console.warn('Not running inside Discord:', error)
    return null
  }
}

const discordSdk = isDiscordEmbeddedContext() ? createDiscordSdk() : null

export async function setupDiscord() {
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
    await withTimeout(discordSdk.ready(), DISCORD_READY_TIMEOUT_MS, 'discord_ready')

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
    )

    const { access_token: accessToken } = await withTimeout(
      exchangeDiscordCode(code),
      DISCORD_TOKEN_EXCHANGE_TIMEOUT_MS,
      'discord_exchange_token',
    )
    const auth = await withTimeout(
      discordSdk.commands.authenticate({
        access_token: accessToken,
      }),
      DISCORD_AUTHENTICATE_TIMEOUT_MS,
      'discord_authenticate',
    )

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
  if (!discordSdk || !activity) {
    return false
  }

  await discordSdk.commands.setActivity({ activity })
  return true
}

export function getDiscordSdk() {
  return discordSdk
}
