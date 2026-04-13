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

function getTimeValue(value) {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) ? time : 0
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
  })
  const lastUploadedLocalUpdatedAtRef = useRef(null)
  const lastSeenRemoteUpdatedAtRef = useRef(null)

  const setSyncState = useCallback((patch) => {
    setState((current) => ({
      ...current,
      ...patch,
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

    return true
  }, [importSettings, setSyncState, stores.gameStore])

  const synchronizeNow = useCallback(async ({
    forceUpload = false,
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
      return uploaded
    }

    const remoteUpdatedAtValue = getTimeValue(cloudSave.updatedAt)
    const lastSeenRemoteValue = getTimeValue(lastSeenRemoteUpdatedAtRef.current)

    if (forceDownload || remoteUpdatedAtValue > localUpdatedAtValue) {
      return applyRemoteSave(cloudSave)
    }

    if (forceUpload || localUpdatedAtValue > remoteUpdatedAtValue) {
      const uploaded = await uploadLatestSave({
        force: true,
        playerIdOverride: playerId,
      })

      if (uploaded) {
        lastSeenRemoteUpdatedAtRef.current = cloudSave.updatedAt ?? lastSeenRemoteUpdatedAtRef.current
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

    return false
  }, [applyRemoteSave, setSyncState, state.playerId, uploadLatestSave])

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

        await synchronizeNow({ forceUpload: true, playerIdOverride: playerId })
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
      await synchronizeNow({
        forceUpload: true,
      })
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

  const value = useMemo(() => ({
    ...state,
    manualSync,
  }), [manualSync, state])

  return <DiscordActivityContext.Provider value={value}>{children}</DiscordActivityContext.Provider>
}

export function useDiscordActivity() {
  const ctx = useContext(DiscordActivityContext)

  if (!ctx) {
    throw new Error('useDiscordActivity must be used within DiscordActivityProvider')
  }

  return ctx
}
