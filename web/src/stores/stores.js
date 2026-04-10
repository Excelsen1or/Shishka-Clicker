import {makeAutoObservable} from "mobx"
import WebsocketStore from "./WebsocketStore.js"


class stores {
	constructor() {
		this.websocketStore = new WebsocketStore(this)

		makeAutoObservable(this)
	}
}

export default new stores()