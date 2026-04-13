import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed',
    })
  }

  try {
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

    const { playerId, appVersion, save, expectedVersion = null, force = false } = req.body ?? {}

    if (!playerId || !save) {
      return res.status(400).json({
        ok: false,
        error: 'playerId and save are required',
      })
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)
    const normalizedPlayerId = String(playerId)

    const { data: existingRows, error: selectError } = await supabase
      .from('player_saves')
      .select('id, save_data, updated_at, app_version, save_version')
      .eq('player_id', normalizedPlayerId)
      .order('updated_at', { ascending: false })

    if (selectError) {
      console.error('SAVE_SELECT_ERROR', selectError)
      return res.status(500).json({
        ok: false,
        error: selectError.message,
      })
    }

    if (existingRows?.length) {
      const newestRow = existingRows[0]

      if (!force && expectedVersion !== null && Number(expectedVersion) !== Number(newestRow.save_version ?? 0)) {
        return res.status(409).json({
          ok: false,
          error: 'save_conflict',
          current: {
            save: newestRow.save_data,
            updatedAt: newestRow.updated_at,
            appVersion: newestRow.app_version,
            saveVersion: newestRow.save_version ?? null,
          },
        })
      }

      const nextVersion = Number(newestRow.save_version ?? 0) + 1
      const { data: updatedRow, error } = await supabase
        .from('player_saves')
        .update({
          player_id: normalizedPlayerId,
          app_version: appVersion ?? null,
          save_version: nextVersion,
          save_data: save,
        })
        .eq('id', newestRow.id)
        .select('updated_at, save_version')
        .single()

      if (error) {
        console.error('SAVE_ERROR', error)
        return res.status(500).json({
          ok: false,
          error: error.message,
        })
      }

      return res.status(200).json({
        ok: true,
        saveVersion: updatedRow?.save_version ?? nextVersion,
        updatedAt: updatedRow?.updated_at ?? new Date().toISOString(),
      })
    }

    const { data: insertedRow, error } = await supabase
      .from('player_saves')
      .insert({
        player_id: normalizedPlayerId,
        app_version: appVersion ?? null,
        save_version: 1,
        save_data: save,
      })
      .select('updated_at, save_version')
      .single()

    if (error) {
      console.error('SAVE_ERROR', error)
      return res.status(500).json({
        ok: false,
        error: error.message,
      })
    }

    return res.status(200).json({
      ok: true,
      saveVersion: insertedRow?.save_version ?? 1,
      updatedAt: insertedRow?.updated_at ?? new Date().toISOString(),
    })
  } catch (error) {
    console.error('SAVE_FATAL', error)
    return res.status(500).json({
      ok: false,
      error: 'internal_error',
    })
  }
}
