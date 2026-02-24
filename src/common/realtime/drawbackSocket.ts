import { io, type Socket } from 'socket.io-client'

type ChatRequestedPayload = {
  requestId: string
  fromUser: {
    id: string
    displayName: string
  }
  message: string
}

type ChatResponsePayload = {
  requestId: string
  accepted: boolean
  roomId: string | null
  requesterUserId?: string
  responderUserId?: string
}

type ChatJoinedPayload = {
  roomId: string
  requestId: string
  peers: string[]
}

type SocketErrorPayload = {
  message: string
  status?: number
}

type DrawStrokePayload = {
  requestId: string
  stroke: unknown
}

type DrawClearPayload = {
  requestId: string
}

type DrawPeerJoinedPayload = {
  userId: string
}

type DrawPeerLeftPayload = {
  userId: string
}

type ServerToClientEvents = {
  'chat.requested': (payload: ChatRequestedPayload) => void
  'chat.response': (payload: ChatResponsePayload) => void
  'chat.joined': (payload: ChatJoinedPayload) => void
  'draw.peer.joined': (payload: DrawPeerJoinedPayload) => void
  'draw.peer.left': (payload: DrawPeerLeftPayload) => void
  'draw.stroke': (payload: DrawStrokePayload) => void
  'draw.clear': (payload: DrawClearPayload) => void
  error: (payload: SocketErrorPayload) => void
}

type ClientToServerEvents = {
  'chat.join': (payload: { requestId: string }) => void
  'draw.leave': () => void
  'draw.stroke': (payload: DrawStrokePayload) => void
  'draw.clear': (payload: DrawClearPayload) => void
}

type DrawbackSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: DrawbackSocket | null = null
let currentToken: string | null = null

const normalizeBaseUrl = (baseUrl: string): string => {
  const value = baseUrl.trim().replace(/\/$/, '')
  if (!value) {
    throw new Error('Missing VITE_BACKEND_URL. Cannot initialize WebSocket connection.')
  }
  return value
}

const buildNamespaceUrl = (baseUrl: string): string => {
  const normalized = normalizeBaseUrl(baseUrl)
  // Use only the origin so that a path prefix in VITE_BACKEND_URL (e.g. /api)
  // is not treated as part of the Socket.IO namespace.
  try {
    const { origin } = new URL(normalized)
    return `${origin}/drawback`
  } catch {
    // If URL parsing fails fall back to the normalized value
    return `${normalized}/drawback`
  }
}

export const getOrCreateDrawbackSocket = (baseUrl: string, token: string): DrawbackSocket => {
  if (!token.trim()) {
    throw new Error('Missing access token. Cannot initialize WebSocket connection.')
  }

  if (socket && currentToken === token) {
    if (!socket.connected) {
      socket.connect()
    }
    return socket
  }

  if (socket) {
    socket.disconnect()
    socket = null
  }

  currentToken = token

  socket = io(buildNamespaceUrl(baseUrl), {
    auth: { token },
    autoConnect: true,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  // iOS Safari suspends network when the tab is backgrounded or the screen locks.
  // Re-connect when the user returns to the page.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && socket && !socket.connected) {
      socket.connect()
    }
  })

  return socket
}

export const emitChatJoin = (requestId: string): void => {
  if (!socket || !requestId) {
    return
  }
  socket.emit('chat.join', { requestId })
}

export const emitDrawLeave = (): void => {
  if (!socket) {
    return
  }
  socket.emit('draw.leave')
}

export const emitDrawStroke = (requestId: string, stroke: unknown): void => {
  if (!socket || !requestId) {
    return
  }

  socket.emit('draw.stroke', { requestId, stroke })
}

export const emitDrawClear = (requestId: string): void => {
  if (!socket || !requestId) {
    return
  }

  socket.emit('draw.clear', { requestId })
}

export const disconnectDrawbackSocket = (): void => {
  if (!socket) {
    return
  }

  socket.disconnect()
  socket = null
  currentToken = null
}
