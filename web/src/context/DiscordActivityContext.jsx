import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useGameStore, useWebsocketStore } from '../stores/StoresProvider.jsx'
import { useSettingsContext } from './SettingsContext.jsx'
import { setDiscordRichPresence, setupDiscord } from '../discord.js'
import { APP_VERSION } from '../config/appMeta.js'
import { createSaveBundle, normalizeImportedBundle } from '../lib/saveTransfer.js'
import { downloadCloudSave, uploadCloudSave } from '../lib/cloudSave.js'
import { clearLegacyGame, loadLegacyGameRecord } from '../lib/storage.js'
import { resolvePlayerId } from '../lib/playerId.js'

const DiscordActivityContext = createContext(null)
const AUTO_SYNC_INTERVAL_MS = 2500
const EMPTY_PROGRESS_SCORE_THRESHOLD = 25
const INITIAL_SYNC_BLOCKING_MS = 1500

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
  const gameStore = useGameStore()
  const websocketStore = useWebsocketStore()
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
    offlineMode: false,
    saveReady: false,
  })
  const remoteVersionRef = useRef(null)
  const syncedClientRevisionRef = useRef(null)
  const discordSdkRef = useRef(null)
  const lastPresenceSignatureRef = useRef('')
  const discordBootstrapStartedRef = useRef(false)
  const offlineModeRef = useRef(false)

  const wait = useCallback((ms) => new Promise((resolve) => {
    const timeoutId = window.setTimeout(resolve, ms)
    return () => window.clearTimeout(timeoutId)
  }), [])

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

  const enterOfflineMode = useCallback(() => {
    offlineModeRef.current = true

    setState((current) => ({
      ...current,
      playerId: current.playerId ?? resolvePlayerId(null),
      saveReady: true,
      offlineMode: true,
      syncState: 'offline',
      syncSource: 'offline',
      syncError: null,
      conflict: null,
      lastSyncedAt: null,
    }))
  }, [])

  const getLocalSnapshot = useCallback(() => {
    const meta = gameStore.getSaveMeta()

    return {
      state: gameStore.exportGameSave(),
      updatedAt: meta.updatedAt,
      clientRevision: meta.clientRevision,
    }
  }, [gameStore])

  const markSynced = useCallback(({ remoteUpdatedAt, remoteVersion, source }) => {
    const localSnapshot = getLocalSnapshot()

    syncedClientRevisionRef.current = localSnapshot.clientRevision
    remoteVersionRef.current = remoteVersion ?? null

    setSyncState({
      syncState: 'synced',
      syncError: null,
      lastSyncedAt: remoteUpdatedAt ?? localSnapshot.updatedAt ?? new Date().toISOString(),
      syncSource: source,
    })

    clearConflict()
  }, [clearConflict, getLocalSnapshot, setSyncState])

  const openConflict = useCallback(({ playerId, cloudSave, reason }) => {
    const localSnapshot = getLocalSnapshot()
    const remoteGameState = getGameStateFromCloudSave(cloudSave)

    setState((current) => ({
      ...current,
      syncState: 'conflict',
      syncError: null,
      syncSource: 'conflict',
      conflict: {
        reason,
        playerId,
        local: buildSnapshotSummary(
          localSnapshot.state,
          localSnapshot.updatedAt,
          'local',
          remoteVersionRef.current,
        ),
        remote: buildSnapshotSummary(remoteGameState, cloudSave?.updatedAt, 'cloud', cloudSave?.saveVersion ?? null),
        cloudSave,
      },
    }))
  }, [getLocalSnapshot])

  const applyRemoteSave = useCallback((cloudSave) => {
    if (!cloudSave?.save) return false

    const imported = normalizeImportedBundle(cloudSave.save)
    gameStore.importGameSave(imported.game, {
      markDirty: false,
      updatedAt: cloudSave.updatedAt ?? new Date().toISOString(),
    })

    if (imported.settings) {
      importSettings(imported.settings)
    }

    markSynced({
      remoteUpdatedAt: cloudSave.updatedAt,
      remoteVersion: cloudSave.saveVersion ?? null,
      source: 'download',
    })

    return true
  }, [gameStore, importSettings, markSynced])

  const uploadLatestSave = useCallback(async ({
    force = false,
    playerIdOverride = null,
    expectedVersionOverride = undefined,
    source = 'upload',
  } = {}) => {
    if (offlineModeRef.current) return false

    const playerId = playerIdOverride ?? state.playerId

    if (!playerId) return false

    const localSnapshot = getLocalSnapshot()

    if (!force && localSnapshot.clientRevision === syncedClientRevisionRef.current) {
      return false
    }

    const save = createSaveBundle({
      gameState: localSnapshot.state,
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
      remoteUpdatedAt: result.updatedAt ?? localSnapshot.updatedAt ?? new Date().toISOString(),
      remoteVersion: result.saveVersion ?? remoteVersionRef.current,
      source,
    })

    return true
  }, [exportSettings, getLocalSnapshot, markSynced, setSyncState, state.playerId])

  const flushLatestSaveOnExit = useCallback(({ playerIdOverride = null } = {}) => {
    if (offlineModeRef.current) return

    const playerId = playerIdOverride ?? state.playerId
    if (!playerId) return

    const localSnapshot = getLocalSnapshot()

    if (localSnapshot.clientRevision === syncedClientRevisionRef.current) {
      return
    }

    const save = createSaveBundle({
      gameState: localSnapshot.state,
      settings: exportSettings(),
      appVersion: APP_VERSION,
    })

    void uploadCloudSave({
      playerId,
      appVersion: APP_VERSION,
      save,
      expectedVersion: remoteVersionRef.current,
      force: false,
    }).then((result) => {
      syncedClientRevisionRef.current = localSnapshot.clientRevision
      remoteVersionRef.current = result?.saveVersion ?? remoteVersionRef.current
    }).catch((error) => {
      console.warn('Failed to flush save on exit:', error)
    })
  }, [exportSettings, getLocalSnapshot, state.playerId])

  const synchronizeNow = useCallback(async ({
    forceDownload = false,
    playerIdOverride = null,
    allowLegacyMigration = false,
  } = {}) => {
    if (offlineModeRef.current) return false

    const playerId = playerIdOverride ?? state.playerId
    if (!playerId) return false

    setSyncState({
      syncState: 'syncing',
      syncError: null,
    })

    const localSnapshot = getLocalSnapshot()
    const localGameState = localSnapshot.state
    const localProgressScore = getProgressScore(localGameState)
    const localIsNearlyEmpty = localProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const hasCompletedInitialSync = syncedClientRevisionRef.current !== null
    const localDirty =
      hasCompletedInitialSync &&
      localSnapshot.clientRevision !== syncedClientRevisionRef.current
    const cloudSave = await downloadCloudSave(playerId)

    if (offlineModeRef.current) return false

    if (!cloudSave?.save) {
      if (allowLegacyMigration) {
        const legacyRecord = loadLegacyGameRecord()
        const legacyProgressScore = getProgressScore(legacyRecord.state)

        if (legacyProgressScore > EMPTY_PROGRESS_SCORE_THRESHOLD) {
          gameStore.importGameSave(legacyRecord.state, {
            markDirty: true,
            updatedAt: legacyRecord.updatedAt ?? new Date().toISOString(),
          })

          const migrated = await uploadLatestSave({
            playerIdOverride: playerId,
            expectedVersionOverride: null,
            source: 'migration',
          })

          if (migrated) {
            clearLegacyGame()
          }

          return migrated
        }
      }

      if (localIsNearlyEmpty) {
        markSynced({
          remoteUpdatedAt: localSnapshot.updatedAt,
          remoteVersion: null,
          source: 'noop',
        })
        return false
      }

      return uploadLatestSave({
        playerIdOverride: playerId,
        expectedVersionOverride: null,
      })
    }

    const remoteGameState = getGameStateFromCloudSave(cloudSave)
    const remoteProgressScore = getProgressScore(remoteGameState)
    const remoteIsNearlyEmpty = remoteProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const knownRemoteVersion = remoteVersionRef.current
    const remoteVersion = cloudSave.saveVersion ?? null

    if (offlineModeRef.current) return false

    if (localIsNearlyEmpty && !remoteIsNearlyEmpty) {
      const applied = applyRemoteSave(cloudSave)
      if (allowLegacyMigration) clearLegacyGame()
      return applied
    }

    if (!localIsNearlyEmpty && remoteIsNearlyEmpty) {
      const uploaded = await uploadLatestSave({
        playerIdOverride: playerId,
        expectedVersionOverride: remoteVersion,
      })
      if (allowLegacyMigration) clearLegacyGame()
      return uploaded
    }

    if (forceDownload) {
      const applied = applyRemoteSave(cloudSave)
      if (allowLegacyMigration) clearLegacyGame()
      return applied
    }

    if (knownRemoteVersion == null) {
      if (!localDirty || localIsNearlyEmpty) {
        const applied = applyRemoteSave(cloudSave)
        if (allowLegacyMigration) clearLegacyGame()
        return applied
      }

      openConflict({
        playerId,
        cloudSave,
        reason: 'first_sync_conflict',
      })
      return false
    }

    if (remoteVersion !== knownRemoteVersion) {
      if (!localDirty) {
        const applied = applyRemoteSave(cloudSave)
        if (allowLegacyMigration) clearLegacyGame()
        return applied
      }

      openConflict({
        playerId,
        cloudSave,
        reason: 'remote_changed_while_local_dirty',
      })
      return false
    }

    if (!localDirty) {
      if (allowLegacyMigration) clearLegacyGame()

      markSynced({
        remoteUpdatedAt: cloudSave.updatedAt,
        remoteVersion,
        source: 'noop',
      })
      return false
    }

    try {
      const uploaded = await uploadLatestSave({
        playerIdOverride: playerId,
        expectedVersionOverride: knownRemoteVersion,
      })
      if (allowLegacyMigration) clearLegacyGame()
      return uploaded
    } catch (error) {
      if (error?.code === 'cloud_conflict' && error.current) {
        openConflict({
          playerId,
          cloudSave: error.current,
          reason: 'save_rejected_by_server_revision',
        })
        return false
      }

      throw error
    }
  }, [applyRemoteSave, gameStore, getLocalSnapshot, markSynced, openConflict, setSyncState, state.playerId, uploadLatestSave])

  useEffect(() => {
    if (discordBootstrapStartedRef.current) {
      return undefined
    }

    discordBootstrapStartedRef.current = true
    let cancelled = false

    const bootstrap = async () => {
      offlineModeRef.current = false

      setState((current) => ({
        ...current,
        status: 'connecting',
        error: null,
        syncState: 'loading',
        syncError: null,
        offlineMode: false,
        saveReady: false,
      }))

      try {
        const session = await setupDiscord()
        if (cancelled || offlineModeRef.current) return

        const isActivity = Boolean(session?.isActivity && session.user?.id)
        const playerId = resolvePlayerId(session?.user?.id ?? null)

        if (!playerId) {
          throw new Error('player_id_unavailable')
        }

        discordSdkRef.current = session?.discordSdk ?? null
        lastPresenceSignatureRef.current = ''
        websocketStore.setUser(isActivity ? session.user : null)

        setState((current) => ({
          ...current,
          isActivity,
          status: 'ready',
          user: isActivity ? session.user : null,
          playerId,
          error: null,
          syncState: 'loading',
          syncError: null,
          offlineMode: false,
          presenceState: 'idle',
          presenceError: null,
        }))

        const initialSyncPromise = synchronizeNow({
          playerIdOverride: playerId,
          allowLegacyMigration: true,
        })
        let didFinishWithinBootWindow = false

        await Promise.race([
          initialSyncPromise.then(() => {
            didFinishWithinBootWindow = true
          }),
          wait(INITIAL_SYNC_BLOCKING_MS),
        ])

        if (cancelled || offlineModeRef.current) return

        setState((current) => ({
          ...current,
          saveReady: true,
        }))

        if (!didFinishWithinBootWindow) {
          void initialSyncPromise.catch((error) => {
            if (cancelled || offlineModeRef.current) return

            setState((current) => ({
              ...current,
              syncState: 'error',
              syncError: error instanceof Error ? error.message : 'initial_sync_failed',
            }))
          })
        }
      } catch (error) {
        if (cancelled || offlineModeRef.current) return

        discordSdkRef.current = null
        lastPresenceSignatureRef.current = ''
        websocketStore.setUser(null)

        setState((current) => ({
          ...current,
          status: 'error',
          error: error instanceof Error ? error.message : 'discord_activity_init_failed',
          syncState: 'error',
          syncError: error instanceof Error ? error.message : 'discord_activity_init_failed',
          offlineMode: false,
          presenceState: current.isActivity ? 'error' : 'idle',
          presenceError: current.isActivity
            ? (error instanceof Error ? error.message : 'discord_activity_init_failed')
            : null,
          saveReady: true,
        }))
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [synchronizeNow, wait, websocketStore])

  useEffect(() => {
    if (!state.playerId || !state.saveReady || state.offlineMode) return undefined

    const intervalId = window.setInterval(() => {
      void synchronizeNow()
    }, AUTO_SYNC_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [state.offlineMode, state.playerId, state.saveReady, synchronizeNow])

  useEffect(() => {
    if (!state.playerId || !state.saveReady || state.offlineMode) return undefined

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
  }, [flushLatestSaveOnExit, state.offlineMode, state.playerId, state.saveReady])

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
      if (state.offlineMode) {
        offlineModeRef.current = false
        setState((current) => ({
          ...current,
          offlineMode: false,
          syncState: 'loading',
          syncError: null,
        }))
      }

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
  }, [state.offlineMode, synchronizeNow])

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
    enterOfflineMode,
  }), [acceptCloudSave, clearConflict, enterOfflineMode, keepLocalSave, manualSync, state, updateRichPresence])

  return <DiscordActivityContext.Provider value={value}>{children}</DiscordActivityContext.Provider>
}

export function useDiscordActivity() {
  const ctx = useContext(DiscordActivityContext)

  if (!ctx) {
    throw new Error('useDiscordActivity must be used within DiscordActivityProvider')
  }

  return ctx
}
