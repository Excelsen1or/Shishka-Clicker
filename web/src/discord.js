import { DiscordSDK } from '@discord/embedded-app-sdk'
import { exchangeDiscordCode } from './lib/discordAuth.js'

const DISCORD_CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? import.meta.env.VITE_DISCORD_CLIENT_ID
const DISCORD_ACTIVITY_SCOPES = ['identify', 'rpc.activities.write']

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

const discordSdk = createDiscordSdk()

export async function setupDiscord() {
  if (!discordSdk) {
    return {
      isActivity: false,
      discordSdk: null,
      auth: null,
      user: null,
    }
  }

  try {
    await discordSdk.ready()

    const { code } = await discordSdk.commands.authorize({
      client_id: DISCORD_CLIENT_ID,
      response_type: 'code',
      state: 'discord-activity',
      prompt: 'none',
      scope: DISCORD_ACTIVITY_SCOPES,
    })

    const { access_token: accessToken } = await exchangeDiscordCode(code)
    const auth = await discordSdk.commands.authenticate({
      access_token: accessToken,
    })

    if (!auth) {
      throw new Error('Authenticate command returned null')
    }

    return {
      isActivity: true,
      discordSdk,
      auth,
      user: auth.user ?? null,
    }
  } catch (error) {
    console.warn('Failed to initialize Discord activity:', error)
    return {
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
