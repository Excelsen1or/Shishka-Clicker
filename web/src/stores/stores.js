import { makeAutoObservable } from 'mobx'
import WebsocketStore from './WebsocketStore.js'
import GameStore from './GameStore.js'

class stores {
  constructor() {
    this.websocketStore = new WebsocketStore(this)
    this.gameStore = new GameStore(this)

    makeAutoObservable(this)
  }
}

export default new stores()
