import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useStores } from '../stores/StoresProvider.jsx'
import { useSettingsContext } from './SettingsContext.jsx'
import { setDiscordRichPresence, setupDiscord } from '../discord.js'
import { APP_VERSION } from '../config/appMeta.js'
import { createSaveBundle, normalizeImportedBundle } from '../lib/saveTransfer.js'
import { downloadCloudSave, uploadCloudSave } from '../lib/cloudSave.js'
import { loadGameRecord } from '../lib/storage.js'
import { buildDiscordPlayerId } from '../lib/playerId.js'

const DiscordActivityContext = createContext(null)
const AUTO_SYNC_INTERVAL_MS = 5000
const EMPTY_PROGRESS_SCORE_THRESHOLD = 25

function sumLevels(map) {
  if (!map || typeof map !== 'object') return 0

  return Object.values(map).reduce((total, value) => {
    const nextValue = Number(value)
    return total + (Number.isFinite(nextValue) ? nextValue : 0)
  }, 0)
}

function countUnlockedAchievements(achievements) {
  if (!achievements || typeof achievements !== 'object') return 0

  return Object.values(achievements).reduce((total, value) => total + (value ? 1 : 0), 0)
}

function getProgressScore(gameState) {
  if (!gameState || typeof gameState !== 'object') {
    return 0
  }

  return (
    Math.log10(1 + Math.max(0, Number(gameState.lifetimeShishkiEarned ?? gameState.totalShishkiEarned ?? 0))) * 120 +
    Math.log10(1 + Math.max(0, Number(gameState.lifetimeMoneyEarned ?? gameState.totalMoneyEarned ?? 0))) * 80 +
    Math.log10(1 + Math.max(0, Number(gameState.lifetimeKnowledgeEarned ?? gameState.totalKnowledgeEarned ?? 0))) * 95 +
    Math.log10(1 + Math.max(0, Number(gameState.totalPrestigeShardsEarned ?? gameState.prestigeShards ?? 0))) * 220 +
    Math.max(0, Number(gameState.rebirths ?? 0)) * 180 +
    Math.max(0, Number(gameState.megaClicks ?? 0)) * 0.4 +
    Math.max(0, Number(gameState.manualClicks ?? 0)) * 0.02 +
    sumLevels(gameState.subscriptions) * 8 +
    sumLevels(gameState.upgrades) * 5 +
    sumLevels(gameState.prestigeUpgrades) * 30 +
    countUnlockedAchievements(gameState.achievements) * 18
  )
}

function getGameStateFromCloudSave(cloudSave) {
  if (!cloudSave?.save) return null

  try {
    return normalizeImportedBundle(cloudSave.save).game
  } catch (error) {
    console.warn('Failed to extract cloud save payload:', error)
    return null
  }
}

function buildSnapshotSummary(gameState, updatedAt, source, saveVersion = null) {
  return {
    source,
    updatedAt: updatedAt ?? null,
    saveVersion,
    progressScore: Math.round(getProgressScore(gameState)),
    lifetimeShishkiEarned: Number(gameState?.lifetimeShishkiEarned ?? gameState?.totalShishkiEarned ?? 0),
    lifetimeMoneyEarned: Number(gameState?.lifetimeMoneyEarned ?? gameState?.totalMoneyEarned ?? 0),
    lifetimeKnowledgeEarned: Number(gameState?.lifetimeKnowledgeEarned ?? gameState?.totalKnowledgeEarned ?? 0),
    rebirths: Number(gameState?.rebirths ?? 0),
    prestigeShards: Number(gameState?.prestigeShards ?? 0),
    achievements: countUnlockedAchievements(gameState?.achievements),
    subscriptions: sumLevels(gameState?.subscriptions),
    upgrades: sumLevels(gameState?.upgrades),
  }
}

export function DiscordActivityProvider({ children }) {
  const stores = useStores()
  const { exportSettings, importSettings } = useSettingsContext()
  const [state, setState] = useState({
    isActivity: false,
    status: 'idle',
    user: null,
    playerId: null,
    error: null,
    syncState: 'idle',
    syncError: null,
    lastSyncedAt: null,
    syncSource: null,
    conflict: null,
    presenceState: 'idle',
    presenceError: null,
    lastPresenceAt: null,
  })
  const remoteVersionRef = useRef(null)
  const syncedLocalUpdatedAtRef = useRef(null)
  const discordSdkRef = useRef(null)
  const lastPresenceSignatureRef = useRef('')

  const setSyncState = useCallback((patch) => {
    setState((current) => ({
      ...current,
      ...patch,
    }))
  }, [])

  const clearConflict = useCallback(() => {
    setState((current) => ({
      ...current,
      conflict: null,
    }))
  }, [])

  const markSynced = useCallback(({ localUpdatedAt, remoteUpdatedAt, remoteVersion, source }) => {
    syncedLocalUpdatedAtRef.current = localUpdatedAt ?? null
    remoteVersionRef.current = remoteVersion ?? null

    setSyncState({
      syncState: 'synced',
      syncError: null,
      lastSyncedAt: remoteUpdatedAt ?? localUpdatedAt ?? new Date().toISOString(),
      syncSource: source,
    })

    clearConflict()
  }, [clearConflict, setSyncState])

  const openConflict = useCallback(({ playerId, localRecord, cloudSave, reason }) => {
    const remoteGameState = getGameStateFromCloudSave(cloudSave)

    setState((current) => ({
      ...current,
      syncState: 'conflict',
      syncError: null,
      syncSource: 'conflict',
      conflict: {
        reason,
        playerId,
        local: buildSnapshotSummary(localRecord.state, localRecord.updatedAt, 'local', remoteVersionRef.current),
        remote: buildSnapshotSummary(remoteGameState, cloudSave?.updatedAt, 'cloud', cloudSave?.saveVersion ?? null),
        cloudSave,
      },
    }))
  }, [])

  const applyRemoteSave = useCallback((cloudSave) => {
    if (!cloudSave?.save) return false

    const imported = normalizeImportedBundle(cloudSave.save)
    stores.gameStore.importGameSave(imported.game)

    if (imported.settings) {
      importSettings(imported.settings)
    }

    const localRecord = loadGameRecord()

    markSynced({
      localUpdatedAt: localRecord.updatedAt,
      remoteUpdatedAt: cloudSave.updatedAt,
      remoteVersion: cloudSave.saveVersion ?? null,
      source: 'download',
    })

    return true
  }, [importSettings, markSynced, stores.gameStore])

  const uploadLatestSave = useCallback(async ({
    force = false,
    playerIdOverride = null,
    expectedVersionOverride = undefined,
  } = {}) => {
    const playerId = playerIdOverride ?? state.playerId

    if (!playerId) return false

    const localRecord = loadGameRecord()
    const localUpdatedAt = localRecord.updatedAt

    if (!force && (!localUpdatedAt || syncedLocalUpdatedAtRef.current === localUpdatedAt)) {
      return false
    }

    const save = createSaveBundle({
      gameState: stores.gameStore.exportGameSave(),
      settings: exportSettings(),
      appVersion: APP_VERSION,
    })

    setSyncState({
      syncState: 'syncing',
      syncError: null,
    })

    const result = await uploadCloudSave({
      playerId,
      appVersion: APP_VERSION,
      save,
      expectedVersion: expectedVersionOverride === undefined ? remoteVersionRef.current : expectedVersionOverride,
      force,
    })

    markSynced({
      localUpdatedAt,
      remoteUpdatedAt: result.updatedAt ?? new Date().toISOString(),
      remoteVersion: result.saveVersion ?? remoteVersionRef.current,
      source: 'upload',
    })

    return true
  }, [exportSettings, markSynced, setSyncState, state.playerId, stores.gameStore])

  const flushLatestSaveOnExit = useCallback(({ playerIdOverride = null } = {}) => {
    const playerId = playerIdOverride ?? state.playerId
    if (!playerId) return

    const localRecord = loadGameRecord()
    const localUpdatedAt = localRecord.updatedAt

    if (!localUpdatedAt || syncedLocalUpdatedAtRef.current === localUpdatedAt) {
      return
    }

    const save = createSaveBundle({
      gameState: stores.gameStore.exportGameSave(),
      settings: exportSettings(),
      appVersion: APP_VERSION,
    })

    void uploadCloudSave({
      playerId,
      appVersion: APP_VERSION,
      save,
      expectedVersion: remoteVersionRef.current,
      force: true,
    }).then((result) => {
      syncedLocalUpdatedAtRef.current = localUpdatedAt
      remoteVersionRef.current = result?.saveVersion ?? remoteVersionRef.current
    }).catch((error) => {
      console.warn('Failed to flush save on exit:', error)
    })
  }, [exportSettings, state.playerId, stores.gameStore])

  const synchronizeNow = useCallback(async ({ forceDownload = false, playerIdOverride = null } = {}) => {
    const playerId = playerIdOverride ?? state.playerId
    if (!playerId) return false

    setSyncState({
      syncState: 'syncing',
      syncError: null,
    })

    const localRecord = loadGameRecord()
    const localGameState = localRecord.state
    const localProgressScore = getProgressScore(localGameState)
    const localIsNearlyEmpty = localProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const localDirty =
      Boolean(localRecord.updatedAt) &&
      localRecord.updatedAt !== syncedLocalUpdatedAtRef.current

    const cloudSave = await downloadCloudSave(playerId)

    if (!cloudSave?.save) {
      if (localIsNearlyEmpty) {
        markSynced({
          localUpdatedAt: localRecord.updatedAt,
          remoteUpdatedAt: localRecord.updatedAt,
          remoteVersion: null,
          source: 'noop',
        })
        return false
      }

      return uploadLatestSave({
        force: true,
        playerIdOverride: playerId,
        expectedVersionOverride: null,
      })
    }

    const remoteGameState = getGameStateFromCloudSave(cloudSave)
    const remoteProgressScore = getProgressScore(remoteGameState)
    const remoteIsNearlyEmpty = remoteProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const knownRemoteVersion = remoteVersionRef.current
    const remoteVersion = cloudSave.saveVersion ?? null

    if (localIsNearlyEmpty && !remoteIsNearlyEmpty) {
      return applyRemoteSave(cloudSave)
    }

    if (!localIsNearlyEmpty && remoteIsNearlyEmpty) {
      return uploadLatestSave({
        force: true,
        playerIdOverride: playerId,
        expectedVersionOverride: remoteVersion,
      })
    }

    if (forceDownload) {
      return applyRemoteSave(cloudSave)
    }

    if (knownRemoteVersion == null) {
      if (!localDirty || localIsNearlyEmpty) {
        return applyRemoteSave(cloudSave)
      }

      openConflict({
        playerId,
        localRecord,
        cloudSave,
        reason: 'first_sync_conflict',
      })
      return false
    }

    if (remoteVersion !== knownRemoteVersion) {
      if (!localDirty) {
        return applyRemoteSave(cloudSave)
      }

      openConflict({
        playerId,
        localRecord,
        cloudSave,
        reason: 'remote_changed_while_local_dirty',
      })
      return false
    }

    if (!localDirty) {
      markSynced({
        localUpdatedAt: localRecord.updatedAt,
        remoteUpdatedAt: cloudSave.updatedAt,
        remoteVersion,
        source: 'noop',
      })
      return false
    }

    try {
      return await uploadLatestSave({
        force: true,
        playerIdOverride: playerId,
        expectedVersionOverride: knownRemoteVersion,
      })
    } catch (error) {
      if (error?.code === 'cloud_conflict' && error.current) {
        openConflict({
          playerId,
          localRecord,
          cloudSave: error.current,
          reason: 'save_rejected_by_server_revision',
        })
        return false
      }

      throw error
    }
  }, [applyRemoteSave, markSynced, openConflict, setSyncState, state.playerId, uploadLatestSave])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      setState((current) => ({
        ...current,
        status: 'connecting',
        error: null,
        syncError: null,
      }))

      try {
        const session = await setupDiscord()

        if (cancelled || !session?.isActivity || !session.user?.id) {
          discordSdkRef.current = null
          lastPresenceSignatureRef.current = ''

          setState((current) => ({
            ...current,
            isActivity: false,
            status: 'idle',
            presenceState: 'idle',
            presenceError: null,
          }))
          return
        }

        const playerId = buildDiscordPlayerId(session.user.id)
        discordSdkRef.current = session.discordSdk ?? null
        lastPresenceSignatureRef.current = ''

        setState((current) => ({
          ...current,
          isActivity: true,
          status: 'ready',
          user: session.user,
          playerId,
          error: null,
          syncState: 'loading',
          syncError: null,
          presenceState: 'idle',
          presenceError: null,
        }))

        await synchronizeNow({ playerIdOverride: playerId })
      } catch (error) {
        if (cancelled) return

        discordSdkRef.current = null
        lastPresenceSignatureRef.current = ''

        setState((current) => ({
          ...current,
          status: current.isActivity ? current.status : 'error',
          error: error instanceof Error ? error.message : 'discord_activity_init_failed',
          syncState: 'error',
          syncError: error instanceof Error ? error.message : 'discord_activity_init_failed',
          presenceState: 'error',
          presenceError: error instanceof Error ? error.message : 'discord_activity_init_failed',
        }))
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [synchronizeNow])

  useEffect(() => {
    if (!state.playerId) return undefined

    const intervalId = window.setInterval(() => {
      void synchronizeNow()
    }, AUTO_SYNC_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [state.playerId, synchronizeNow])

  useEffect(() => {
    if (!state.playerId) return undefined

    const handlePageHide = () => {
      flushLatestSaveOnExit()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushLatestSaveOnExit()
      }
    }

    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [flushLatestSaveOnExit, state.playerId])

  const updateRichPresence = useCallback(async (activity) => {
    if (!state.isActivity || state.status !== 'ready' || !discordSdkRef.current || !activity) {
      return false
    }

    const signature = JSON.stringify(activity)

    if (lastPresenceSignatureRef.current === signature && state.presenceState === 'ready') {
      return true
    }

    try {
      await setDiscordRichPresence(activity)
      lastPresenceSignatureRef.current = signature

      setState((current) => ({
        ...current,
        presenceState: 'ready',
        presenceError: null,
        lastPresenceAt: new Date().toISOString(),
      }))

      return true
    } catch (error) {
      setState((current) => ({
        ...current,
        presenceState: 'error',
        presenceError: error instanceof Error ? error.message : 'rich_presence_update_failed',
      }))
      return false
    }
  }, [state.isActivity, state.presenceState, state.status])

  const manualSync = useCallback(async () => {
    try {
      await synchronizeNow()
      return true
    } catch (error) {
      setState((current) => ({
        ...current,
        syncState: 'error',
        syncError: error instanceof Error ? error.message : 'manual_sync_failed',
      }))
      return false
    }
  }, [synchronizeNow])

  const acceptCloudSave = useCallback(async () => {
    const conflict = state.conflict
    if (!conflict?.cloudSave) return false

    try {
      applyRemoteSave(conflict.cloudSave)
      return true
    } catch (error) {
      setState((current) => ({
        ...current,
        syncState: 'error',
        syncError: error instanceof Error ? error.message : 'accept_cloud_save_failed',
      }))
      return false
    }
  }, [applyRemoteSave, state.conflict])

  const keepLocalSave = useCallback(async () => {
    const conflict = state.conflict
    if (!conflict?.playerId) return false

    try {
      await uploadLatestSave({
        force: true,
        playerIdOverride: conflict.playerId,
        expectedVersionOverride: null,
      })
      clearConflict()
      return true
    } catch (error) {
      setState((current) => ({
        ...current,
        syncState: 'error',
        syncError: error instanceof Error ? error.message : 'keep_local_save_failed',
      }))
      return false
    }
  }, [clearConflict, state.conflict, uploadLatestSave])

  const value = useMemo(() => ({
    ...state,
    manualSync,
    updateRichPresence,
    acceptCloudSave,
    keepLocalSave,
    clearConflict,
  }), [acceptCloudSave, clearConflict, keepLocalSave, manualSync, state, updateRichPresence])

  return <DiscordActivityContext.Provider value={value}>{children}</DiscordActivityContext.Provider>
}

export function useDiscordActivity() {
  const ctx = useContext(DiscordActivityContext)

  if (!ctx) {
    throw new Error('useDiscordActivity must be used within DiscordActivityProvider')
  }

  return ctx
}
