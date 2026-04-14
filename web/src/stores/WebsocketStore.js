import {makeAutoObservable, runInAction} from 'mobx'
import { io } from 'socket.io-client'


const WEBSOCKET_URL = 'https://shishki.default-squad.ru/'

export const WEBSOCKET_STATE = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export default class WebsocketStore {
  socket
  user
  data = []
  CURRENT_STATE = WEBSOCKET_STATE.LOADING
  rootStore

  constructor(rootStore) {
    this.rootStore = rootStore
    makeAutoObservable(this, { rootStore: false }, { autoBind: true })
    this.init()
  }

  get username() {
    return this.user?.global_name || this.user?.username || null
  }

  get shishkiTotal() {
    return Math.round(this.rootStore.gameStore._state.lifetimeShishkiEarned)
  }

  sendDataToServer() {
    if (!this.username || !this.socket) return

    this.socket.emit('client_data', {
      username: this.username,
      shishki: this.shishkiTotal,
    })
  }

  log(message) {
    console.log(`WebSocket | ${message}`)
  }

  init() {
    setInterval(this.sendDataToServer, 5 * 1000)
    this.socket = io(WEBSOCKET_URL)

    this.socket.on('connect', this.connectSuccess)
    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected', reason)

      if (reason === 'transport close') {
        this.connectErrorFailure()
      }
    })
    this.socket.on('connect_error', (error) => {
      this.log(`"Connect error": ${error}`)
    })
    this.socket.on('top_list', this.updateTopList)
  }

  emit(type, data) {
    this.socket?.emit(type, JSON.stringify(data))
  }

  connectSuccess() {
    this.CURRENT_STATE = WEBSOCKET_STATE.SUCCESS
  }

  connectErrorFailure() {
    runInAction(() => {
			this.CURRENT_STATE = WEBSOCKET_STATE.FAILURE
		})
    this.log('Connection failure')
  }

	updateTopList(data) {
		runInAction(() => {
			this.data = data
		})
	}

	setUser = (user) => {
		runInAction(() => {
			this.user = user
		})
	}

}
