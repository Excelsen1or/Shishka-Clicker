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
import { setupDiscord } from '../discord.js'
import { APP_VERSION } from '../config/appMeta.js'
import { createSaveBundle, normalizeImportedBundle } from '../lib/saveTransfer.js'
import { downloadCloudSave, uploadCloudSave } from '../lib/cloudSave.js'
import { loadGameRecord } from '../lib/storage.js'
import { buildDiscordPlayerId } from '../lib/playerId.js'

const DiscordActivityContext = createContext(null)
const AUTO_SYNC_INTERVAL_MS = 15000
const EMPTY_PROGRESS_SCORE_THRESHOLD = 25
const CONFLICT_PROGRESS_SCORE_GAP = 140

function getTimeValue(value) {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) ? time : 0
}

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
  })
  const lastUploadedLocalUpdatedAtRef = useRef(null)
  const lastSeenRemoteUpdatedAtRef = useRef(null)

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

  const uploadLatestSave = useCallback(async ({ force = false, playerIdOverride = null } = {}) => {
    const playerId = playerIdOverride ?? state.playerId

    if (!playerId) return false

    const localRecord = loadGameRecord()
    const localUpdatedAt = localRecord.updatedAt

    if (!force && (!localUpdatedAt || lastUploadedLocalUpdatedAtRef.current === localUpdatedAt)) {
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

    await uploadCloudSave({
      playerId,
      appVersion: APP_VERSION,
      save,
    })

    lastUploadedLocalUpdatedAtRef.current = localUpdatedAt ?? new Date().toISOString()

    setSyncState({
      syncState: 'synced',
      syncError: null,
      lastSyncedAt: new Date().toISOString(),
      syncSource: 'upload',
    })

    return true
  }, [exportSettings, setSyncState, state.playerId, stores.gameStore])

  const applyRemoteSave = useCallback((cloudSave) => {
    if (!cloudSave?.save) return false

    const imported = normalizeImportedBundle(cloudSave.save)
    stores.gameStore.importGameSave(imported.game)

    if (imported.settings) {
      importSettings(imported.settings)
    }

    const localRecord = loadGameRecord()
    lastUploadedLocalUpdatedAtRef.current = localRecord.updatedAt
    lastSeenRemoteUpdatedAtRef.current = cloudSave.updatedAt ?? null

    setSyncState({
      syncState: 'synced',
      syncError: null,
      lastSyncedAt: cloudSave.updatedAt ?? new Date().toISOString(),
      syncSource: 'download',
    })

    clearConflict()

    return true
  }, [clearConflict, importSettings, setSyncState, stores.gameStore])

  const buildSnapshotSummary = useCallback((gameState, updatedAt, source) => ({
    source,
    updatedAt: updatedAt ?? null,
    progressScore: Math.round(getProgressScore(gameState)),
    lifetimeShishkiEarned: Number(gameState?.lifetimeShishkiEarned ?? gameState?.totalShishkiEarned ?? 0),
    lifetimeMoneyEarned: Number(gameState?.lifetimeMoneyEarned ?? gameState?.totalMoneyEarned ?? 0),
    lifetimeKnowledgeEarned: Number(gameState?.lifetimeKnowledgeEarned ?? gameState?.totalKnowledgeEarned ?? 0),
    rebirths: Number(gameState?.rebirths ?? 0),
    prestigeShards: Number(gameState?.prestigeShards ?? 0),
    achievements: countUnlockedAchievements(gameState?.achievements),
    subscriptions: sumLevels(gameState?.subscriptions),
    upgrades: sumLevels(gameState?.upgrades),
  }), [])

  const openConflict = useCallback(({ localRecord, cloudSave, playerId, winner }) => {
    const remoteGameState = getGameStateFromCloudSave(cloudSave)
    const localGameState = localRecord.state

    setState((current) => ({
      ...current,
      syncState: 'conflict',
      syncError: null,
      syncSource: 'conflict',
      conflict: {
        winner,
        playerId,
        local: buildSnapshotSummary(localGameState, localRecord.updatedAt, 'local'),
        remote: buildSnapshotSummary(remoteGameState, cloudSave?.updatedAt, 'cloud'),
        cloudSave,
      },
    }))
  }, [buildSnapshotSummary])

  const synchronizeNow = useCallback(async ({
    forceDownload = false,
    playerIdOverride = null,
  } = {}) => {
    const playerId = playerIdOverride ?? state.playerId
    if (!playerId) return false

    setSyncState({
      syncState: 'syncing',
      syncError: null,
    })

    const localRecord = loadGameRecord()
    const localUpdatedAtValue = getTimeValue(localRecord.updatedAt)
    const cloudSave = await downloadCloudSave(playerId)

    if (!cloudSave?.save) {
      lastSeenRemoteUpdatedAtRef.current = null
      const uploaded = await uploadLatestSave({ force: true, playerIdOverride: playerId })
      if (uploaded) {
        clearConflict()
      }
      return uploaded
    }

    const remoteGameState = getGameStateFromCloudSave(cloudSave)
    const remoteUpdatedAtValue = getTimeValue(cloudSave.updatedAt)
    const lastSeenRemoteValue = getTimeValue(lastSeenRemoteUpdatedAtRef.current)
    const localProgressScore = getProgressScore(localRecord.state)
    const remoteProgressScore = getProgressScore(remoteGameState)
    const localIsNearlyEmpty = localProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const remoteIsNearlyEmpty = remoteProgressScore <= EMPTY_PROGRESS_SCORE_THRESHOLD
    const progressGap = Math.abs(localProgressScore - remoteProgressScore)

    if (!localIsNearlyEmpty && remoteIsNearlyEmpty) {
      const uploaded = await uploadLatestSave({
        force: true,
        playerIdOverride: playerId,
      })

      if (uploaded) {
        clearConflict()
      }

      return uploaded
    }

    if (localIsNearlyEmpty && !remoteIsNearlyEmpty) {
      return applyRemoteSave(cloudSave)
    }

    if (forceDownload) {
      return applyRemoteSave(cloudSave)
    }

    if (
      remoteUpdatedAtValue > localUpdatedAtValue &&
      !remoteIsNearlyEmpty &&
      !localIsNearlyEmpty &&
      localProgressScore > remoteProgressScore &&
      progressGap >= CONFLICT_PROGRESS_SCORE_GAP
    ) {
      openConflict({
        localRecord,
        cloudSave,
        playerId,
        winner: 'cloud_by_timestamp',
      })
      return false
    }

    if (
      localUpdatedAtValue > remoteUpdatedAtValue &&
      !remoteIsNearlyEmpty &&
      !localIsNearlyEmpty &&
      remoteProgressScore > localProgressScore &&
      progressGap >= CONFLICT_PROGRESS_SCORE_GAP
    ) {
      openConflict({
        localRecord,
        cloudSave,
        playerId,
        winner: 'local_by_timestamp',
      })
      return false
    }

    if (remoteUpdatedAtValue > localUpdatedAtValue) {
      return applyRemoteSave(cloudSave)
    }

    if (localUpdatedAtValue > remoteUpdatedAtValue) {
      const uploaded = await uploadLatestSave({
        force: true,
        playerIdOverride: playerId,
      })

      if (uploaded) {
        lastSeenRemoteUpdatedAtRef.current = cloudSave.updatedAt ?? lastSeenRemoteUpdatedAtRef.current
        clearConflict()
      }

      return uploaded
    }

    lastSeenRemoteUpdatedAtRef.current =
      remoteUpdatedAtValue >= lastSeenRemoteValue
        ? (cloudSave.updatedAt ?? lastSeenRemoteUpdatedAtRef.current)
        : lastSeenRemoteUpdatedAtRef.current

    setSyncState({
      syncState: 'synced',
      syncError: null,
      lastSyncedAt: cloudSave.updatedAt ?? localRecord.updatedAt ?? new Date().toISOString(),
      syncSource: 'noop',
    })

    clearConflict()

    return false
  }, [applyRemoteSave, clearConflict, openConflict, setSyncState, state.playerId, uploadLatestSave])

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
          setState((current) => ({
            ...current,
            isActivity: false,
            status: 'idle',
          }))
          return
        }

        const playerId = buildDiscordPlayerId(session.user.id)

        setState((current) => ({
          ...current,
          isActivity: true,
          status: 'ready',
          user: session.user,
          playerId,
          error: null,
          syncState: 'loading',
          syncError: null,
        }))

        await synchronizeNow({ playerIdOverride: playerId })
      } catch (error) {
        if (cancelled) return

        setState((current) => ({
          ...current,
          status: current.isActivity ? current.status : 'error',
          error: error instanceof Error ? error.message : 'discord_activity_init_failed',
          syncState: 'error',
          syncError: error instanceof Error ? error.message : 'discord_activity_init_failed',
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
    acceptCloudSave,
    keepLocalSave,
    clearConflict,
  }), [acceptCloudSave, clearConflict, keepLocalSave, manualSync, state])

  return <DiscordActivityContext.Provider value={value}>{children}</DiscordActivityContext.Provider>
}

export function useDiscordActivity() {
  const ctx = useContext(DiscordActivityContext)

  if (!ctx) {
    throw new Error('useDiscordActivity must be used within DiscordActivityProvider')
  }

  return ctx
}
