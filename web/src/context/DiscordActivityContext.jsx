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
import { setDiscordRichPresence, setupDiscord } from '../discord.js'
import { APP_VERSION } from '../config/appMeta.js'
import { createSaveBundle, normalizeImportedBundle } from '../lib/saveTransfer.js'
import { downloadCloudSave, initializeCloudSession, uploadCloudSave } from '../lib/cloudSave.js'
import { clearLegacyGame, loadLegacyGameRecord } from '../lib/storage.js'
import { resolvePlayerId } from '../lib/playerId.js'

const DiscordActivityContext = createContext(null)
const AUTO_SYNC_INTERVAL_MS = 2500
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

function chooseSyncWinner(localGameState, remoteCloudSave) {
  const remoteGameState = getGameStateFromCloudSave(remoteCloudSave)
  const localScore = getProgressScore(localGameState)
  const remoteScore = getProgressScore(remoteGameState)

  if (!remoteGameState) {
    return 'local'
  }

  if (remoteScore > localScore) {
    return 'remote'
  }

  if (localScore > remoteScore) {
    return 'local'
  }

  const remoteUpdatedAt = Date.parse(remoteCloudSave?.updatedAt ?? '') || 0
  return remoteUpdatedAt > 0 ? 'remote' : 'local'
}

export function DiscordActivityProvider({ children }) {
  const gameStore = useGameStore()
  const websocketStore = useWebsocketStore()
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

  const setSyncState = useCallback((patch) => {
    setState((current) => ({
      ...current,
      ...patch,
    }))
  }, [])

  const enterOfflineMode = useCallback(() => {
    offlineModeRef.current = true
    websocketStore.start()
    void websocketStore.refreshLeaderboard()

    setState((current) => ({
      ...current,
      playerId: current.playerId ?? resolvePlayerId(null),
      saveReady: true,
      offlineMode: true,
      syncState: 'offline',
      syncSource: 'offline',
      syncError: null,
      lastSyncedAt: null,
    }))
  }, [websocketStore])

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
  }, [getLocalSnapshot, setSyncState])

  const applyRemoteSave = useCallback((cloudSave) => {
    if (!cloudSave?.save) return false

    const imported = normalizeImportedBundle(cloudSave.save)
    gameStore.importGameSave(imported.game, {
      markDirty: false,
      updatedAt: cloudSave.updatedAt ?? new Date().toISOString(),
    })

    markSynced({
      remoteUpdatedAt: cloudSave.updatedAt,
      remoteVersion: cloudSave.saveVersion ?? null,
      source: 'download',
    })

    return true
  }, [gameStore, markSynced])

  const uploadLatestSave = useCallback(async ({
    force = false,
    expectedVersionOverride = undefined,
    source = 'upload',
  } = {}) => {
    if (offlineModeRef.current) return false
    if (!state.playerId) return false

    const localSnapshot = getLocalSnapshot()

    if (!force && localSnapshot.clientRevision === syncedClientRevisionRef.current) {
      return false
    }

    const save = createSaveBundle({
      gameState: localSnapshot.state,
      includeSettings: false,
      appVersion: APP_VERSION,
    })

    setSyncState({
      syncState: 'syncing',
      syncError: null,
    })

    const result = await uploadCloudSave({
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
  }, [getLocalSnapshot, markSynced, setSyncState, state.playerId])

  const flushLatestSaveOnExit = useCallback(() => {
    if (offlineModeRef.current) return
    if (!state.playerId) return

    const localSnapshot = getLocalSnapshot()

    if (localSnapshot.clientRevision === syncedClientRevisionRef.current) {
      return
    }

    const save = createSaveBundle({
      gameState: localSnapshot.state,
      includeSettings: false,
      appVersion: APP_VERSION,
    })

    void uploadCloudSave({
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
  }, [getLocalSnapshot, state.playerId])

  const synchronizeNow = useCallback(async ({
    forceDownload = false,
    allowLegacyMigration = false,
  } = {}) => {
    if (offlineModeRef.current) return false

    if (!state.playerId) return false

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
    const knownRemoteVersion = remoteVersionRef.current
    const cloudSave = await downloadCloudSave()

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
        expectedVersionOverride: null,
      })
    }

    const remoteGameState = getGameStateFromCloudSave(cloudSave)
    const remoteProgressScore = getProgressScore(remoteGameState)
    const remoteIsNearlyEmpty = remoteProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const remoteVersion = cloudSave.saveVersion ?? null

    if (offlineModeRef.current) return false

    if (forceDownload) {
      const applied = applyRemoteSave(cloudSave)
      if (allowLegacyMigration) clearLegacyGame()
      return applied
    }

    if (!hasCompletedInitialSync) {
      const applied = applyRemoteSave(cloudSave)
      if (allowLegacyMigration) clearLegacyGame()
      return applied
    }

    if (localIsNearlyEmpty && !remoteIsNearlyEmpty) {
      const applied = applyRemoteSave(cloudSave)
      if (allowLegacyMigration) clearLegacyGame()
      return applied
    }

    if (!localIsNearlyEmpty && remoteIsNearlyEmpty) {
      const uploaded = await uploadLatestSave({
        expectedVersionOverride: remoteVersion,
      })
      if (allowLegacyMigration) clearLegacyGame()
      return uploaded
    }

    if (!localDirty) {
      if (remoteVersion !== knownRemoteVersion) {
        const applied = applyRemoteSave(cloudSave)
        if (allowLegacyMigration) clearLegacyGame()
        return applied
      }

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
        force: knownRemoteVersion !== null && remoteVersion !== knownRemoteVersion,
        expectedVersionOverride: knownRemoteVersion !== null && remoteVersion === knownRemoteVersion
          ? knownRemoteVersion
          : null,
        source: knownRemoteVersion !== null && remoteVersion !== knownRemoteVersion ? 'override' : 'upload',
      })
      if (allowLegacyMigration) clearLegacyGame()
      return uploaded
    } catch (error) {
      if (error?.code === 'cloud_conflict') {
        const localSnapshot = getLocalSnapshot()
        const conflictSave = error.current?.save
          ? {
              save: error.current.save,
              updatedAt: error.current.updatedAt ?? null,
              appVersion: error.current.appVersion ?? null,
              saveVersion: error.current.saveVersion ?? null,
            }
          : null

        if (conflictSave && chooseSyncWinner(localSnapshot.state, conflictSave) === 'remote') {
          const applied = applyRemoteSave(conflictSave)
          if (allowLegacyMigration) clearLegacyGame()
          return applied
        }

        const uploaded = await uploadLatestSave({
          force: true,
          expectedVersionOverride: null,
          source: 'override',
        })
        if (allowLegacyMigration) clearLegacyGame()
        return uploaded
      }

      throw error
    }
  }, [applyRemoteSave, gameStore, getLocalSnapshot, markSynced, setSyncState, state.playerId, uploadLatestSave])

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

        if (session?.mode === 'activity_error' && session?.error) {
          throw session.error
        }

        const isActivity = Boolean(session?.isActivity && session.user?.id)
        let playerId = isActivity ? resolvePlayerId(session?.user?.id ?? null) : null

        if (!isActivity) {
          const deviceSession = await initializeCloudSession()
          if (cancelled || offlineModeRef.current) return
          playerId = deviceSession?.playerId ?? null
        }

        if (!playerId) {
          throw new Error('player_id_unavailable')
        }

        discordSdkRef.current = session?.discordSdk ?? null
        lastPresenceSignatureRef.current = ''
        websocketStore.setUser(isActivity ? session.user : null)
        websocketStore.start()

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

        const leaderboardPromise = websocketStore.refreshLeaderboard()
        const syncPromise = synchronizeNow({
          allowLegacyMigration: true,
        })

        await Promise.allSettled([syncPromise, leaderboardPromise])

        if (cancelled || offlineModeRef.current) return

        setState((current) => ({
          ...current,
          saveReady: true,
        }))
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
          saveReady: false,
        }))
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [synchronizeNow, websocketStore])

  useEffect(() => {
    if (!state.playerId || !state.saveReady || state.offlineMode) return undefined

    const intervalId = window.setInterval(() => {
      void synchronizeNow().catch((error) => {
        if (offlineModeRef.current) return

        setState((current) => ({
          ...current,
          syncState: 'error',
          syncError: error instanceof Error ? error.message : 'background_sync_failed',
        }))
      })
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
        let nextPlayerId = state.playerId

        if (!state.isActivity) {
          const deviceSession = await initializeCloudSession()
          nextPlayerId = deviceSession?.playerId ?? nextPlayerId
        }

        offlineModeRef.current = false
        setState((current) => ({
          ...current,
          playerId: nextPlayerId ?? current.playerId,
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
  }, [state.isActivity, state.offlineMode, state.playerId, synchronizeNow])

  const value = useMemo(() => ({
    ...state,
    manualSync,
    updateRichPresence,
    enterOfflineMode,
  }), [enterOfflineMode, manualSync, state, updateRichPresence])

  return <DiscordActivityContext.Provider value={value}>{children}</DiscordActivityContext.Provider>
}

export function useDiscordActivity() {
  const ctx = useContext(DiscordActivityContext)

  if (!ctx) {
    throw new Error('useDiscordActivity must be used within DiscordActivityProvider')
  }

  return ctx
}
