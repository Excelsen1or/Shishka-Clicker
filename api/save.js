import { createServerSupabase } from './_lib/supabase.js'
import { requireSession } from './_lib/session.js'

function buildConflictPayload(currentSave) {
  return {
    ok: false,
    error: 'save_conflict',
    current: {
      save: currentSave.save,
      updatedAt: currentSave.updatedAt,
      appVersion: currentSave.appVersion,
      saveVersion: currentSave.saveVersion ?? null,
    },
  }
}

function isMissingSaveRpc(error) {
  return (
    error?.code === 'PGRST202' ||
    error?.code === '42883' ||
    error?.message?.includes('save_player_progress')
  )
}

async function saveViaRpc({ supabase, playerId, appVersion, save, expectedVersion, force }) {
  const { data, error } = await supabase
    .rpc('save_player_progress', {
      p_player_id: playerId,
      p_app_version: appVersion ?? null,
      p_save_data: save,
      p_expected_version: expectedVersion,
      p_force: force,
    })
    .single()

  if (error) {
    throw error
  }

  if (!data?.did_save) {
    return {
      ok: false,
      conflict: {
        save: data?.current_save_data ?? null,
        updatedAt: data?.current_updated_at ?? null,
        appVersion: data?.current_app_version ?? null,
        saveVersion: data?.current_save_version ?? null,
      },
    }
  }

  return {
    ok: true,
    updatedAt: data.updated_at ?? new Date().toISOString(),
    saveVersion: data.save_version ?? null,
  }
}

async function saveViaLegacyQueries({ supabase, playerId, appVersion, save, expectedVersion, force }) {
  const { data: existingSave, error: selectError } = await supabase
    .from('player_saves')
    .select('save_data, updated_at, app_version, save_version')
    .eq('player_id', playerId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existingSave) {
    if (!force && expectedVersion !== null && Number(expectedVersion) !== Number(existingSave.save_version ?? 0)) {
      return {
        ok: false,
        conflict: {
          save: existingSave.save_data,
          updatedAt: existingSave.updated_at,
          appVersion: existingSave.app_version,
          saveVersion: existingSave.save_version ?? null,
        },
      }
    }

    const nextVersion = Number(existingSave.save_version ?? 0) + 1
    const { data: updatedRow, error } = await supabase
      .from('player_saves')
      .update({
        app_version: appVersion ?? null,
        save_version: nextVersion,
        save_data: save,
      })
      .eq('player_id', playerId)
      .select('updated_at, save_version')
      .single()

    if (error) {
      throw error
    }

    return {
      ok: true,
      updatedAt: updatedRow?.updated_at ?? new Date().toISOString(),
      saveVersion: updatedRow?.save_version ?? nextVersion,
    }
  }

  const { data: insertedRow, error } = await supabase
    .from('player_saves')
    .insert({
      player_id: playerId,
      app_version: appVersion ?? null,
      save_version: 1,
      save_data: save,
    })
    .select('updated_at, save_version')
    .single()

  if (error) {
    throw error
  }

  return {
    ok: true,
    updatedAt: insertedRow?.updated_at ?? new Date().toISOString(),
    saveVersion: insertedRow?.save_version ?? 1,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'method_not_allowed',
    })
  }

  try {
    const session = requireSession(req, res)
    if (!session) return

    const { appVersion, save, expectedVersion = null, force = false } = req.body ?? {}

    if (!save) {
      return res.status(400).json({
        ok: false,
        error: 'save is required',
      })
    }

    const supabase = createServerSupabase()
    const playerId = String(session.playerId)
    let result

    try {
      result = await saveViaRpc({
        supabase,
        playerId,
        appVersion,
        save,
        expectedVersion,
        force,
      })
    } catch (error) {
      if (!isMissingSaveRpc(error)) {
        console.error('SAVE_RPC_ERROR', error)
        return res.status(500).json({
          ok: false,
          error: error.message,
        })
      }

      result = await saveViaLegacyQueries({
        supabase,
        playerId,
        appVersion,
        save,
        expectedVersion,
        force,
      })
    }

    if (!result.ok) {
      return res.status(409).json(buildConflictPayload(result.conflict))
    }

    return res.status(200).json({
      ok: true,
      saveVersion: result.saveVersion,
      updatedAt: result.updatedAt,
    })
  } catch (error) {
    console.error('SAVE_FATAL', error)
    return res.status(500).json({
      ok: false,
      error:
        error instanceof Error &&
        (error.message === 'missing_SUPABASE_URL' || error.message === 'missing_SUPABASE_SERVICE_ROLE_KEY')
          ? error.message
          : 'internal_error',
    })
  }
}
