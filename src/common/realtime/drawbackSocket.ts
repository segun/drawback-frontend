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

type ServerToClientEvents = {
  'chat.requested': (payload: ChatRequestedPayload) => void
  'chat.response': (payload: ChatResponsePayload) => void
  'chat.joined': (payload: ChatJoinedPayload) => void
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

const buildNamespaceUrl = (baseUrl: string): string => `${normalizeBaseUrl(baseUrl)}/drawback`

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
