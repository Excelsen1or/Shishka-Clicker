import {corsOptions, server} from "../index"
import {Server} from "socket.io"


export class ServerSocket {
	static io: Server
	static users: any = new Map()

	static async addClientToMap(data: any) {
		this.users.set("client", data)
	}

	static async sendToClients(event: string, data: any) {
		if (this.io.engine.clientsCount > 0) {
			this.io.emit(event, data)
		}
	}

	static async updateTopList() {
		// сформировать ответ
		const usersArr = [...this.users.entries()]
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

		this.io.on("connection", socket => {
			// console.log("Client connected", socket.id, socket.data.user)
			this.updateTopList()

			socket.on("disconnect", async (reason) => {
				await this.updateTopList()
			})

			socket.on("send", data => {
				console.log("send Обработать:", data)
			})

			socket.on("client_data", data => {
				console.log("client_data Обработать:", data)
			})
		})
	}

}
