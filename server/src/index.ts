import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import * as http from 'node:http'

const app = express()
export const server = http.createServer(app)

export const corsOptions = {
  origin: [
    'https://default-squad.ru',
    'https://shishki.default-squad.ru',
    'http://localhost:3001',
    'https://shishka-clicker.vercel.app',
  ],
  credentials: true,
}

app.disable('x-powered-by')
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

const port = Number(process.env.SERVER_PORT) || 8003

server.listen(port, '0.0.0.0', () => {
  console.log('Server running on port ' + port)
})
