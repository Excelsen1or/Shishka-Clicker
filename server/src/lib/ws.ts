import {server} from "../index"
import {Server} from "socket.io"


// export class ServerSocket {
// 	static io: Server
// 	static users: any = new Map()
//
// 	static async addClientToMap(data: any) {
// 		this.users.set(data.username, data)
// 		console.log(`${data.username}:`, data)
// 		await this.updateTopList()
// 	}
//
// 	static async sendToClients(event: string, data: any) {
// 		if (this.io.engine.clientsCount > 0) {
// 			this.io.emit(event, data)
// 		}
// 	}
//
// 	static async updateTopList() {
// 		// сформировать ответ
// 		const usersArr = [...this.users.values()]
// 			.sort(([, a], [, b]) => b.clicks - a.clicks)
// 			.slice(0, 5)
//
// 		// разослать всем
// 		await this.sendToClients("top_list", usersArr)
// 	}
//
// 	static async init() {
// 		await this.initServerSocket()
// 	}
//
// 	static async incomingHandler(socket: any, data: any) {
// 		console.log("Incoming handler", socket, data)
//
// 		const events: any = {
// 			"ping": () => this.sendToWeb(socket, "pong", data),
// 			"client_data": () => {
// 				console.log("Client data", data)
// 				this.addClientToMap(data)
// 			},
// 			"init": async () => this.addClientToMap(data)
// 		}
//
// 		if (!data?.event) return
//
// 		if (data.event in events) {
// 			events[data.event]()
// 		}
// 	}
//
// 	static async initServerSocket() {
// 		this.io = new Server(server, {
// 			cors: {
// 				origin: "*"
// 			}
// 		})
// 		console.log("Server socket created")
//
// 		let activityClient: any = null
//
// 		this.io.on("connection", socket => {
// 			activityClient = socket
// 			console.log("Client connected", socket.id)
//
// 			socket.on("ws-emit", async (data) => await this.incomingHandler(activityClient, data, activityClient))
//
// 			this.updateTopList()
//
// 			socket.on("disconnect", async (reason) => {
// 				activityClient = null
// 				console.log("Client disconnected", socket.id, reason)
// 				await this.updateTopList()
// 			})
// 		})
// 	}
//
// 	static sendToWeb = (socket: any, event: string, data: any) => {
// 		if (!socket) return
//
// 		socket.emit("message", {
// 			type: "ws-event",
// 			event,
// 			data
// 		})
// 	}
// }

export function initSocket() {
	const io = new Server(server, {
		cors: { origin: "*" }
	})

	const users = new Map();

	io.on("connection", (socket) => {
		console.log("Client connected", socket.id)

		socket.on("ws-emit", (msg) => {
			const { event, data } = msg || {}

			if (!event) return

			// === ОБРАБОТКА ===
			if (event === "init") {
				console.log("Init:", data)
				users.set(socket.id, data)
			}

			if (event === "client_data") {
				users.set(socket.id, data)

				// рассылаем всем
				const list = [...users.values()]
					.sort((a, b) => b.shishki - a.shishki)
					.slice(0, 5)

				io.emit("message", {
					type: "ws-event",
					event: "top_list",
					data: list
				})
			}

			if (event === "ping") {
				socket.emit("message", {
					type: "ws-event",
					event: "pong",
					data: {}
				})
			}
		})

		socket.on("disconnect", () => {
			users.delete(socket.id);
			console.log("Disconnected", socket.id)
		})
	})
}