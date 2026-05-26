type EventHandler = (payload?: any) => void

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8000'

class SocketAdapter {
  private ws: WebSocket | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private connected = false

  constructor(private readonly namespace: string = '/spaces') {
    this.connect()
  }

  private toWsUrl() {
    const base = SOCKET_URL.replace(/\/$/, '')
    if (this.namespace.startsWith('/spaces')) {
      return `${base}/ws/spaces/lobby/`
    }
    return `${base}/ws/spaces/lobby/`
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return
    }
    this.ws = new WebSocket(this.toWsUrl())

    this.ws.onopen = () => {
      this.connected = true
      this.dispatch('connect')
    }

    this.ws.onclose = () => {
      this.connected = false
      this.dispatch('disconnect')
    }

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.event) {
          this.dispatch(payload.event, payload.data)
        }
      } catch {
        // Ignore malformed frames from external sources.
      }
    }
  }

  emit(event: string, data?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ event, data }))
  }

  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
  }

  off(event: string, handler?: EventHandler) {
    if (!this.handlers.has(event)) return
    if (!handler) {
      this.handlers.delete(event)
      return
    }
    this.handlers.get(event)!.delete(handler)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected() {
    return this.connected
  }

  private dispatch(event: string, payload?: any) {
    const listeners = this.handlers.get(event)
    if (!listeners) return
    listeners.forEach((handler) => handler(payload))
  }
}

let socket: SocketAdapter | null = null

export const getSocket = (namespace: string = '/spaces'): SocketAdapter => {
  if (!socket) {
    socket = new SocketAdapter(namespace)
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

