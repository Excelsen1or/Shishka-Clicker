import {makeAutoObservable, runInAction} from "mobx"
import { io } from "socket.io-client"
import stores from "./stores.js"


export const WEBSOCKET_STATE = {
	"LOADING": "LOADING",
	"SUCCESS": "SUCCESS",
	"FAILURE": "FAILURE"
}

export default class WebsocketStore {
	socket
	user
	data = []
	CURRENT_STATE = WEBSOCKET_STATE.LOADING

	constructor() {
		makeAutoObservable(this)
		this.init()
	}

	sendDataToServer() {
		const name = "user" // this.user?.global_name || this.user?.username // для теста сделал user

		if (name) {
			this.socket.emit("client_data", {
				username: name,
				shishki: Math.round(stores.gameStore._state.lifetimeShishkiEarned) // здесь можно добавить больше полей для синхронизации
			})
		}
	}

	log(message) {
		console.log(`WebSocket | ${message}`)
	}

	init() {
		setInterval(() => {
			this.sendDataToServer()
		}, 5 * 1000)

		// runInAction(() => {
		// 	this.socket = io("https://shishki.default-squad.ru/")
		// })

		runInAction(() => {
			this.socket = io("http://localhost:8002/") // для тестирования локальный адрес сервера
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

		this.socket.on("top_list", data => {
			this.updateTopList(data)
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

	updateTopList(dataString) {
		runInAction(() => {
			this.data = dataString
		})
	}

	setUser = (user) => {
		runInAction(() => {
			this.user = user
		})
	}

}
