import {makeAutoObservable, runInAction} from "mobx"
import { io } from "socket.io-client"


export const WEBSOCKET_STATE = {
	"LOADING": "LOADING",
	"SUCCESS": "SUCCESS",
	"FAILURE": "FAILURE"
}

export default class WebsocketStore {
	socket
	data
	CURRENT_STATE = WEBSOCKET_STATE.LOADING

	constructor() {
		makeAutoObservable(this)
		this.init()

		setInterval(() => {
			this.sendDataToServer()
		}, 5 * 1000)
	}

	sendDataToServer() {
		this.socket.emit("client_data", { clicks: 10 })
	}

	log(message) {
		console.log(`WebSocket | ${message}`)
	}

	init() {
		runInAction(() => {
			this.socket = io("https://shishki.default-squad.ru/")
		})

		this.socket.on("connect", () => {
			this.connectSuccess()
		})

		this.socket.on("disconnect", (reason) => {
			console.log("[WebSocket] Disconnected", reason)

			switch (reason) {
				case "transport close":
					this.connectErrorFailure()
					break
			}
		})

		this.socket.on("connect_error", (e) => {
			this.log(e)
		})

		this.socket.on("send", data => {
			this.onServerEvent("send", data)
		})
	}

	emit(type, data) {
		const dataString = JSON.stringify(data)
		this.socket.emit(type, dataString)
	}

	connectSuccess() {
		runInAction(() => {
			this.CURRENT_STATE = WEBSOCKET_STATE.SUCCESS
		})
	}

	connectErrorFailure() {
		runInAction(() => {
			this.CURRENT_STATE = WEBSOCKET_STATE.FAILURE
		})

		this.log("Connection failure")
	}

	onServerEvent(type, dataString) {
		let data
		try {
			this.log(`Get from server [${type}]\n${dataString}`)
			data = JSON.parse(dataString)
		} catch (error) {
			return this.log(error.message)
		}

		console.log("Data from server:", data)

		const types = {
			"top_list": () => {
				runInAction(() => {
					this.data = data
				})
			}
		}

		if (data.type in types) {
			types[data.type]()
		}
	}

}
