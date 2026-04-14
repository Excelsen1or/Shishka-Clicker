import {corsOptions, server} from "../index"
import {Server} from "socket.io"


export class ServerSocket {
	static io: Server
	static users: any = new Map()

	static async addClientToMap(data: any) {
		this.users.set(data.username, data)
		console.log(`${data.username}:`, data)
		await this.updateTopList()
	}

	static async sendToClients(event: string, data: any) {
		if (this.io.engine.clientsCount > 0) {
			this.io.emit(event, data)
		}
	}

	static async updateTopList() {
		// сформировать ответ
		const usersArr = [...this.users.values()]
			.sort(([, a], [, b]) => b.clicks - a.clicks)
			.slice(0, 5)

		// разослать всем
		await this.sendToClients("top_list", usersArr)
	}

	static async init() {
		await this.initServerSocket()
	}

	static async initServerSocket() {
		this.io = new Server(server, {
			cors: corsOptions
		})

		console.log("Server socket created")

		this.io.on("connection", socket => {
			console.log("Client connected", socket)
			this.updateTopList()

			socket.on("disconnect", async (reason) => {
				console.log("Client disconnected:", reason)
				await this.updateTopList()
			})

			socket.on("client_data", data => {
				console.log("Client data", data)
				this.addClientToMap(data)
			})
		})
	}

}
