import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        ok: false,
        error: 'method_not_allowed',
      })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return res.status(500).json({
        ok: false,
        error: 'missing_SUPABASE_URL',
      })
    }

    if (!serviceRoleKey) {
      return res.status(500).json({
        ok: false,
        error: 'missing_SUPABASE_SERVICE_ROLE_KEY',
      })
    }

    const { playerId } = req.query

    if (!playerId) {
      return res.status(400).json({
        ok: false,
        error: 'playerId is required',
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data, error } = await supabase
      .from('player_saves')
      .select('save_data, updated_at, app_version')
      .eq('player_id', String(playerId))
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
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'internal_error',
    })
  }
}