import { server } from "../index.js"
import { Server } from "socket.io"

type SocketEvent = "init" | "client_data" | "ping"

type LeaderboardEntry = {
  username: string
  shishki: number
}

type SocketEnvelope = {
  event?: SocketEvent
  data?: Partial<LeaderboardEntry> | null
}

function normalizeEntry(data?: Partial<LeaderboardEntry> | null): LeaderboardEntry | null {
  const username = data?.username?.trim()
  const shishki = Number(data?.shishki ?? 0)

  if (!username) {
    return null
  }

  return {
    username,
    shishki: Number.isFinite(shishki) ? Math.max(0, Math.round(shishki)) : 0,
  }
}

export function initSocket() {
  const io = new Server(server, {
    cors: { origin: "*" },
  })

  const users = new Map<string, LeaderboardEntry>()

  const emitMessage = (event: string, data: unknown) => {
    io.emit("message", {
      type: "ws-event",
      event,
      data,
    })
  }

  const emitTopList = () => {
    const list = [...users.values()]
      .sort((a, b) => b.shishki - a.shishki)
      .slice(0, 5)

    emitMessage("top_list", list)
  }

  io.on("connection", (socket) => {
    console.log("Client connected", socket.id)

    socket.on("ws-emit", (message: SocketEnvelope | null | undefined) => {
      const { event, data } = message ?? {}
      if (!event) return

      if (event === "ping") {
        socket.emit("message", {
          type: "ws-event",
          event: "pong",
          data: {},
        })
        return
      }

      const entry = normalizeEntry(data)
      if (!entry) return

      users.set(socket.id, entry)
      emitTopList()
    })

    socket.on("disconnect", () => {
      users.delete(socket.id)
      console.log("Disconnected", socket.id)
      emitTopList()
    })
  })
}

// Руслан Я просто эксперементирую - восстановим по надобности