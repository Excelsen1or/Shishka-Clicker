import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE_NAME = 'shishka_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180

function getSessionSecret() {
  return process.env.SESSION_SECRET
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf('=')

      if (separatorIndex === -1) return acc

      const key = part.slice(0, separatorIndex)
      const value = part.slice(separatorIndex + 1)
      acc[key] = decodeURIComponent(value)
      return acc
    }, {})
}

function serializeCookie(
  name,
  value,
  {
    maxAge = SESSION_TTL_SECONDS,
    secure = process.env.NODE_ENV === 'production',
  } = {},
) {
  const sameSite = secure ? 'None' : 'Lax'
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${sameSite}`,
    `Max-Age=${maxAge}`,
  ]

  if (secure) {
    parts.push('Secure')
    parts.push('Partitioned')
  }

  return parts.join('; ')
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(encodedPayload) {
  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))
}

function signPayload(encodedPayload, secret) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

export function readSession(req) {
  const secret = getSessionSecret()
  if (!secret) {
    throw new Error('missing_SESSION_SECRET')
  }

  const cookies = parseCookies(req.headers.cookie)
  const rawToken = cookies[SESSION_COOKIE_NAME]
  if (!rawToken) return null

  try {
    const [encodedPayload, signature] = rawToken.split('.')

    if (!encodedPayload || !signature) {
      return null
    }

    const expectedSignature = signPayload(encodedPayload, secret)
    const actualSignatureBuffer = Buffer.from(signature)
    const expectedSignatureBuffer = Buffer.from(expectedSignature)

    if (
      actualSignatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)
    ) {
      return null
    }

    const payload = decodePayload(encodedPayload)

    if (!payload?.sub || !payload?.exp || Number(payload.exp) <= Date.now()) {
      return null
    }

    return {
      playerId: String(payload.sub),
      provider: payload.provider ?? 'unknown',
      playerUsername: payload.playerUsername ?? null,
      discordUserId: payload.discordUserId ?? null,
      deviceId: payload.deviceId ?? null,
    }
  } catch {
    return null
  }
}

export function writeSession(res, session) {
  const secret = getSessionSecret()
  if (!secret) {
    throw new Error('missing_SESSION_SECRET')
  }

  const encodedPayload = encodePayload({
    sub: String(session.playerId),
    provider: session.provider,
    playerUsername: session.playerUsername ?? null,
    discordUserId: session.discordUserId ?? null,
    deviceId: session.deviceId ?? null,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  })
  const signature = signPayload(encodedPayload, secret)
  const token = `${encodedPayload}.${signature}`

  res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE_NAME, token))
  return token
}

export function requireSession(req, res) {
  let session

  try {
    session = readSession(req)
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'session_read_failed',
    })
    return null
  }

  if (!session?.playerId) {
    res.status(401).json({
      ok: false,
      error: 'unauthorized',
    })
    return null
  }

  return session
}
