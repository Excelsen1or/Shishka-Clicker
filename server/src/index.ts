import "dotenv/config"
import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import cors from "cors"
import * as http from "node:http"
import {initSocket} from "./lib/ws"


const app = express()
export const server = http.createServer(app)

export const corsOptions = {
	origin: [
		"https://default-squad.ru",
		"https://shishki.default-squad.ru",
		"http://localhost:3001",
		"https://shishka-clicker.vercel.app"
	],
	credentials: true
}
initSocket()

app.use(cors(corsOptions))
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(express.json())

app.get("/health", (req, res) => {
	res.status(200).send("OK")
})

const port = Number(process.env.SERVER_PORT) || 8003

server.listen(port, "0.0.0.0", () => {
	console.log("Server running on port " + port)
})
