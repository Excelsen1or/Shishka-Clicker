import {makeAutoObservable, runInAction} from 'mobx'
import { socket } from "../lib/activitySocket.js"


export const WEBSOCKET_STATE = {
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export default class WebsocketStore {
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
    console.log("Send data to server", this.username)
    if (!this.username) return

    socket.emit("client_data", {
      username: this.username,
      shishki: this.shishkiTotal
    })
  }

  log = (message) => console.log(`WebSocket | ${message}`)

  connectWithServer = () => this.emit("init", {
    username: this.username
  })

  init() {
    this.log("Initializing")

    this.connectWithServer()

    setInterval(this.sendDataToServer, 5 * 1000)

    socket.on("connect", this.connectSuccess)
    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected', reason)
      if (reason === 'transport close') this.connectErrorFailure()
    })
    socket.on('connect_error', (error) => this.log(`Connect error: ${error}`))
    socket.on('top_list', this.updateTopList)
    socket.on("pong", () => this.log("Ответ от сервера успешно получен и связь установлена!"))
  }

  ping = () => this.emit("ping", {})

  emit = (event, data) =>
    socket.emit(event, {
      username: this.username,
      ...data
    })

  connectSuccess() {
    this.CURRENT_STATE = WEBSOCKET_STATE.SUCCESS
    this.ping()
  }

  connectErrorFailure() {
    runInAction(() => {
			this.CURRENT_STATE = WEBSOCKET_STATE.FAILURE
		})
    this.log("Connection failure")
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
