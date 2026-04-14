import { makeAutoObservable } from 'mobx'
import WebsocketStore from './WebsocketStore.js'
import GameStore from './GameStore.js'

class RootStore {
  constructor() {
    this.websocketStore = new WebsocketStore(this)
    this.gameStore = new GameStore(this)

    makeAutoObservable(this)
  }
}

const rootStore = new RootStore()

export default rootStore
