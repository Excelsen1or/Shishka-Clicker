class ActivitySocket {
	constructor() {
		this.handlers = new Map()

		window.addEventListener("message", (event) => {
			const msg = event.data
			if (!msg || msg.type !== "ws-event") return

			const handlers = this.handlers.get(msg.event)
			if (handlers) {
				handlers.forEach((fn) => fn(msg.data))
			}
		})
	}

	emit(event, data) {
		window.parent.postMessage(
			{
				type: "ws-emit",
				event,
				data
			},
			"*"
		)
	}

	on(event, cb) {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, [])
		}
		this.handlers.get(event).push(cb)
	}

	off(event, cb) {
		const arr = this.handlers.get(event)
		if (!arr) return
		this.handlers.set(event, arr.filter((f) => f !== cb))
	}
}

export const socket = new ActivitySocket()