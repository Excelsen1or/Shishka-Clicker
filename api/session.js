import { randomUUID } from 'node:crypto'
import { readSession, writeSession } from './_lib/session.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed',
    })
  }

  try {
    const existingSession = readSession(req)

    if (existingSession?.playerId && existingSession.provider === 'device') {
      return res.status(200).json({
        ok: true,
        playerId: existingSession.playerId,
        provider: existingSession.provider,
      })
    }

    const playerId = `device:${randomUUID()}`

    writeSession(res, {
      playerId,
      provider: 'device',
      deviceId: playerId,
    })

    return res.status(200).json({
      ok: true,
      playerId,
      provider: 'device',
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'session_init_failed',
    })
  }
}
