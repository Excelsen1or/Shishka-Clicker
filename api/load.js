import { createServerSupabase } from './_lib/supabase.js'
import { requireSession } from './_lib/session.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        ok: false,
        error: 'method_not_allowed',
      })
    }

    const session = requireSession(req, res)
    if (!session) return

    const supabase = createServerSupabase()

    const { data, error } = await supabase
      .from('player_saves')
      .select(
        'save_data, updated_at, app_version, save_version, session_seconds_total',
      )
      .eq('player_id', String(session.playerId))
      .maybeSingle()

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message,
        code: error.code ?? null,
        details: error.details ?? null,
      })
    }

    if (!data) {
      return res.status(404).json({
        ok: false,
        error: 'save_not_found',
      })
    }

    return res.status(200).json({
      ok: true,
      save: data.save_data,
      updatedAt: data.updated_at,
      appVersion: data.app_version,
      saveVersion: data.save_version ?? null,
      sessionSecondsTotal: Number(data.session_seconds_total ?? 0) || 0,
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'internal_error',
    })
  }
}
