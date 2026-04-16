import { writeSession } from './_lib/session.js'

const DISCORD_API_URL = 'https://discord.com/api/oauth2/token'
const DISCORD_ME_API_URL = 'https://discord.com/api/users/@me'

function getDiscordClientId() {
  return process.env.VITE_CLIENT_ID ?? process.env.VITE_DISCORD_CLIENT_ID
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed',
    })
  }

  const clientId = getDiscordClientId()
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const { code } = req.body ?? {}

  if (!clientId) {
    return res.status(500).json({
      ok: false,
      error: 'missing_discord_client_id',
    })
  }

  if (!clientSecret) {
    return res.status(500).json({
      ok: false,
      error: 'missing_discord_client_secret',
    })
  }

  if (!code) {
    return res.status(400).json({
      ok: false,
      error: 'missing_code',
    })
  }

  try {
    const response = await fetch(DISCORD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: String(code),
      }),
    })

    const payload = await response.json()

    if (!response.ok || !payload.access_token) {
      return res.status(500).json({
        ok: false,
        error:
          payload.error_description ?? payload.error ?? 'token_exchange_failed',
      })
    }

    const meResponse = await fetch(DISCORD_ME_API_URL, {
      headers: {
        Authorization: `Bearer ${payload.access_token}`,
      },
    })
    const mePayload = await meResponse.json()

    if (!meResponse.ok || !mePayload?.id) {
      return res.status(500).json({
        ok: false,
        error: mePayload?.message ?? 'discord_user_fetch_failed',
      })
    }

    writeSession(res, {
      playerId: `discord:${String(mePayload.id)}`,
      provider: 'discord',
      playerUsername:
        mePayload.global_name ??
        mePayload.display_name ??
        mePayload.username ??
        null,
      discordUserId: String(mePayload.id),
    })

    return res.status(200).json({
      ok: true,
      access_token: payload.access_token,
      token_type: payload.token_type ?? 'Bearer',
      expires_in: payload.expires_in ?? null,
      scope: payload.scope ?? null,
    })
  } catch (error) {
    console.error('DISCORD_TOKEN_EXCHANGE_FAILED', error)

    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'internal_error',
    })
  }
}
