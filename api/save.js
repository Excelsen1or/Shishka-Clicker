import { createServerSupabase } from './_lib/supabase.js'
import { requireSession } from './_lib/session.js'

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function normalizeAppVersion(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeExpectedVersion(value) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const version = Number(value)
  if (!Number.isSafeInteger(version) || version < 0) {
    return null
  }

  return version
}

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

async function saveViaRpc({
  supabase,
  playerId,
  playerUsername,
  appVersion,
  save,
  expectedVersion,
  force,
}) {
  const { data, error } = await supabase
    .rpc('save_player_progress', {
      p_player_id: playerId,
      p_app_version: appVersion ?? null,
      p_save_data: save,
      p_expected_version: expectedVersion,
      p_force: force,
      p_player_username: playerId.startsWith('discord:')
        ? (playerUsername ?? null)
        : null,
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

async function saveViaLegacyQueries({
  supabase,
  playerId,
  appVersion,
  save,
  expectedVersion,
  force,
}) {
  const { data: existingSave, error: selectError } = await supabase
    .from('player_saves')
    .select('save_data, updated_at, app_version, save_version')
    .eq('player_id', playerId)
    .maybeSingle()

  if (selectError) {
    throw selectError
  }

  if (existingSave) {
    if (
      !force &&
      expectedVersion !== null &&
      Number(expectedVersion) !== Number(existingSave.save_version ?? 0)
    ) {
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

    const { appVersion, save, expectedVersion, force = false } = req.body ?? {}

    if (!isPlainObject(save)) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_save_payload',
      })
    }

    const normalizedExpectedVersion = normalizeExpectedVersion(expectedVersion)

    if (
      expectedVersion !== undefined &&
      expectedVersion !== null &&
      normalizedExpectedVersion === null
    ) {
      return res.status(400).json({
        ok: false,
        error: 'invalid_expected_version',
      })
    }

    const supabase = createServerSupabase()
    const playerId = String(session.playerId)
    const playerUsername = session.playerUsername ?? null
    const normalizedAppVersion = normalizeAppVersion(appVersion)
    let result

    try {
      result = await saveViaRpc({
        supabase,
        playerId,
        playerUsername,
        appVersion: normalizedAppVersion,
        save,
        expectedVersion: normalizedExpectedVersion,
        force: Boolean(force),
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
        appVersion: normalizedAppVersion,
        save,
        expectedVersion: normalizedExpectedVersion,
        force: Boolean(force),
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
        (error.message === 'missing_SUPABASE_URL' ||
          error.message === 'missing_SUPABASE_SERVICE_ROLE_KEY')
          ? error.message
          : 'internal_error',
    })
  }
}
