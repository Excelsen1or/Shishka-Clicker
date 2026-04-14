import { makeAutoObservable, runInAction } from 'mobx'
import { socket } from '../lib/activitySocket.js'

export const WEBSOCKET_STATE = {
  LOADING: 'LOADING',
  READY: 'READY',
  FAILURE: 'FAILURE',
}

export default class WebsocketStore {
  user = null
  data = []
  state = WEBSOCKET_STATE.LOADING
  rootStore
  syncIntervalId = null

  constructor(rootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, { rootStore: false, syncIntervalId: false }, { autoBind: true })
    this.init()
  }

  get username() {
    return this.user?.global_name || this.user?.username || null
  }

  get shishkiTotal() {
    const total = this.rootStore.gameStore?._state?.lifetimeShishkiEarned ?? 0
    return Number.isFinite(total) ? Math.round(total) : 0
  }

  init() {
    socket.on('top_list', this.updateTopList)
    socket.on('pong', this.connectSuccess)
  }

  startSync() {
    if (this.syncIntervalId !== null) return

    this.syncIntervalId = window.setInterval(() => {
      this.sendDataToServer()
    }, 5_000)
  }

  stopSync() {
    if (this.syncIntervalId === null) return

    window.clearInterval(this.syncIntervalId)
    this.syncIntervalId = null
  }

  emit(event, data) {
    socket.emit(event, {
      username: this.username,
      ...data,
    })
  }

  ping() {
    this.emit('ping', {})
  }

  connectWithServer() {
    if (!this.username) return

    this.emit('init', {
      username: this.username,
      shishki: this.shishkiTotal,
    })
  }

  sendDataToServer() {
    if (!this.username) return

    this.emit('client_data', {
      username: this.username,
      shishki: this.shishkiTotal,
    })
  }

  connectSuccess() {
    this.state = WEBSOCKET_STATE.READY
  }

  connectErrorFailure() {
    runInAction(() => {
      this.state = WEBSOCKET_STATE.FAILURE
    })
  }

  updateTopList(data) {
    runInAction(() => {
      this.data = Array.isArray(data) ? data : []
    })
  }

  setUser(user) {
    runInAction(() => {
      this.user = user
      this.data = user ? this.data : []
      this.state = user ? WEBSOCKET_STATE.LOADING : WEBSOCKET_STATE.FAILURE
    })

    this.stopSync()

    if (!user) {
      return
    }

    this.connectWithServer()
    this.ping()
    this.sendDataToServer()
    this.startSync()
  }
}
