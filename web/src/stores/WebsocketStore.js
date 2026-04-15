import { makeAutoObservable, runInAction } from 'mobx'

const LEADERBOARD_REFRESH_MS = 15_000

export const WEBSOCKET_STATE = {
  LOADING: 'LOADING',
  READY: 'READY',
  FAILURE: 'FAILURE',
}

export default class WebsocketStore {
  user = null
  data = []
  leaderboards = {
    shishki: [],
    shards: [],
    clicks: [],
  }
  state = WEBSOCKET_STATE.LOADING
  started = false
  initialLoadComplete = false
  rootStore
  refreshIntervalId = null

  constructor(rootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, { rootStore: false, refreshIntervalId: false }, { autoBind: true })
  }

  start() {
    if (this.started || typeof window === 'undefined') {
      return
    }

    this.started = true
    this.refreshIntervalId = window.setInterval(() => {
      void this.refreshLeaderboard()
    }, LEADERBOARD_REFRESH_MS)
  }

  async refreshLeaderboard() {
    if (this.state !== WEBSOCKET_STATE.READY) {
      this.state = WEBSOCKET_STATE.LOADING
    }

    try {
      const response = await fetch('/api/leaderboard', {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`leaderboard_request_failed:${response.status}`)
      }

      const payload = await response.json()
      const leaderboards = {
        shishki: Array.isArray(payload?.leaderboards?.shishki)
          ? payload.leaderboards.shishki
          : Array.isArray(payload?.leaderboard)
            ? payload.leaderboard
            : [],
        shards: Array.isArray(payload?.leaderboards?.shards) ? payload.leaderboards.shards : [],
        clicks: Array.isArray(payload?.leaderboards?.clicks) ? payload.leaderboards.clicks : [],
      }

      runInAction(() => {
        this.data = leaderboards.shishki
        this.leaderboards = leaderboards
        this.state = WEBSOCKET_STATE.READY
        this.initialLoadComplete = true
      })
    } catch {
      runInAction(() => {
        this.state = WEBSOCKET_STATE.FAILURE
        this.initialLoadComplete = true
      })
    }
  }

  setUser(user) {
    this.user = user
  }
}
