import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { ApiError } from '../../../common/api/apiError'
import { type Notice } from '../../../common/components/NoticeBanner'
import { disconnectDrawbackSocket, emitChatJoin, emitDrawClear, emitDrawLeave, emitDrawStroke, getOrCreateDrawbackSocket } from '../../../common/realtime/drawbackSocket'
import { createAuthApi } from '../api/authApi'
import { type BlockedUser, type ChatRequest, createSocialApi, type SavedChat, type UserMode, type UserProfile } from '../api/socialApi'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants'
import { isValidDisplayName } from '../utils/displayName'
import { AuthModuleView } from './AuthModuleView'

type AuthTab = 'register' | 'login'
type CenterView = 'chat' | 'profile'

type NormalizedPoint = {
  x: number
  y: number
}

type DrawSegmentStroke = {
  kind: 'segment'
  from: NormalizedPoint
  to: NormalizedPoint
  color: string
  width: number
}

const DRAW_WIDTH = 2
const ERASER_WIDTH = 40

const PRESET_COLORS = [
  '#000000',
  '#be123c',
]

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isNormalizedPoint = (value: unknown): value is NormalizedPoint => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as { x?: unknown; y?: unknown }
  return isFiniteNumber(candidate.x) && isFiniteNumber(candidate.y)
}

const isDrawSegmentStroke = (value: unknown): value is DrawSegmentStroke => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as { kind?: unknown; from?: unknown; to?: unknown; color?: unknown; width?: unknown }

  return (
    candidate.kind === 'segment'
    && isNormalizedPoint(candidate.from)
    && isNormalizedPoint(candidate.to)
    && typeof candidate.color === 'string'
    && isFiniteNumber(candidate.width)
  )
}

export function AuthModule() {
  const backendUrl = String(import.meta.env.VITE_BACKEND_URL ?? '').trim()
  const authApi = useMemo(() => createAuthApi(backendUrl), [backendUrl])
  const socialApi = useMemo(() => createSocialApi(authApi), [authApi])
  const [isConfirmRoute] = useState<boolean>(() => typeof window !== 'undefined' && window.location.pathname === '/confirm')

  const [tab, setTab] = useState<AuthTab>(() => (typeof window !== 'undefined' && window.location.pathname === '/confirm' ? 'login' : 'register'))
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerDisplayName, setRegisterDisplayName] = useState('@')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [accessToken, setAccessToken] = useState<string | null>(() => authApi.getAccessToken())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDashboardLoading, setIsDashboardLoading] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [centerView, setCenterView] = useState<CenterView>('chat')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChatRequestId, setSelectedChatRequestId] = useState<string | null>(null)
  const [joinedChatRequestId, setJoinedChatRequestId] = useState<string | null>(null)
  const [peerPresent, setPeerPresent] = useState<boolean>(false)
  const [showReconnectButton, setShowReconnectButton] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [closedRecentChatRequestIds, setClosedRecentChatRequestIds] = useState<Set<string>>(new Set())
  const [waitingPeerRequestIds, setWaitingPeerRequestIds] = useState<Set<string>>(new Set())

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileDisplayName, setProfileDisplayName] = useState('@')
  const [profileMode, setProfileMode] = useState<UserMode>('PRIVATE')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([])
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const loadDashboardDataRef = useRef<(showLoading?: boolean) => Promise<void>>(async () => {})
  const selectedChatRequestIdRef = useRef<string | null>(null)
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const remoteCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const localLastPointRef = useRef<NormalizedPoint | null>(null)
  const [drawColor, setDrawColor] = useState('#be123c')

  const showNotice = (text: string, type: Notice['type'] = 'info'): void => {
    setNotice({ text, type })
  }

  const syncCanvasResolution = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
    const context = canvas.getContext('2d')
    if (!context) {
      return null
    }

    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return null
    }

    // Lock CSS dimensions via inline style BEFORE touching the drawing-buffer
    // attributes. Setting canvas.width / canvas.height changes the element's
    // intrinsic size, which can cause the layout to reflow and the canvas to
    // grow if any ancestor relies on content height.
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const pixelRatio = window.devicePixelRatio || 1
    const width = Math.round(rect.width * pixelRatio)
    const height = Math.round(rect.height * pixelRatio)

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    context.lineCap = 'round'
    context.lineJoin = 'round'

    return context
  }

  const drawSegmentOnCanvas = (canvas: HTMLCanvasElement | null, stroke: DrawSegmentStroke): void => {
    if (!canvas) {
      return
    }

    const context = syncCanvasResolution(canvas)
    if (!context) {
      return
    }

    const width = canvas.clientWidth
    const height = canvas.clientHeight

    if (stroke.color === 'eraser') {
      context.save()
      context.globalCompositeOperation = 'destination-out'
      context.strokeStyle = 'rgba(0,0,0,1)'
      context.lineWidth = stroke.width
      context.beginPath()
      context.moveTo(stroke.from.x * width, stroke.from.y * height)
      context.lineTo(stroke.to.x * width, stroke.to.y * height)
      context.stroke()
      context.restore()
    } else {
      context.strokeStyle = stroke.color
      context.lineWidth = stroke.width
      context.beginPath()
      context.moveTo(stroke.from.x * width, stroke.from.y * height)
      context.lineTo(stroke.to.x * width, stroke.to.y * height)
      context.stroke()
    }
  }

  const clearCanvas = (canvas: HTMLCanvasElement | null): void => {
    if (!canvas) {
      return
    }

    const context = syncCanvasResolution(canvas)
    if (!context) {
      return
    }

    context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  }

  const normalizeRegisterDisplayNameInput = (value: string): string => {
    const trimmedValue = value.trimStart()
    if (!trimmedValue) {
      return '@'
    }

    return trimmedValue.startsWith('@') ? trimmedValue : `@${trimmedValue}`
  }

  const normalizeProfileDisplayNameInput = (value: string): string => {
    const trimmedValue = value.trimStart()
    if (!trimmedValue) {
      return '@'
    }
    return trimmedValue.startsWith('@') ? trimmedValue : `@${trimmedValue}`
  }

  const validateRegisterInput = (): string | null => {
    const email = registerEmail.trim()
    const password = registerPassword
    const displayName = registerDisplayName.trim()

    if (!email || email.length > EMAIL_MAX) {
      return 'Email is required and must be at most 254 characters.'
    }

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      return 'Password must be between 8 and 72 characters.'
    }

    if (!isValidDisplayName(displayName)) {
      return 'Display name must match ^@[a-zA-Z0-9_]{3,29}$.'
    }

    return null
  }

  const mapErrorToMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        return error.message || 'Validation failed. Please check your input.'
      }
      if (error.status === 401) {
        return error.message || 'Invalid credentials or account not activated yet.'
      }
      if (error.status === 409) {
        return error.message || 'Email or display name is already in use.'
      }
      return error.message || `Request failed with status ${error.status}.`
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Something went wrong. Please try again.'
  }

  const resetDashboardData = (): void => {
    setProfile(null)
    setProfileDisplayName('@')
    setProfileMode('PRIVATE')
    setSearchResults([])
    setIsSearching(false)
    setChatRequests([])
    setSavedChats([])
    setBlockedUsers([])
    setCenterView('chat')
    setSearchQuery('')
    setSelectedChatRequestId(null)
    setJoinedChatRequestId(null)
    selectedChatRequestIdRef.current = null
    setClosedRecentChatRequestIds(new Set())
  }

  const loadDashboardData = async (showLoading = true): Promise<void> => {
    if (!accessToken) {
      resetDashboardData()
      return
    }

    if (showLoading) {
      setIsDashboardLoading(true)
    }

    try {
      const [me, sentRequests, receivedRequests, chats, blocks] = await Promise.all([
        socialApi.getMyProfile(),
        socialApi.listSentChatRequests(),
        socialApi.listReceivedChatRequests(),
        socialApi.listSavedChats(),
        socialApi.listBlockedUsers(),
      ])

      setProfile(me)
      setProfileDisplayName(me.displayName)
      setProfileMode(me.mode)
      setChatRequests([...receivedRequests, ...sentRequests].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)))
      setSavedChats(chats)
      setBlockedUsers(blocks)
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      if (showLoading) {
        setIsDashboardLoading(false)
      }
    }
  }

  useEffect(() => {
    loadDashboardDataRef.current = loadDashboardData
  }, [loadDashboardData])

  useEffect(() => {
    const trimmed = searchQuery.trim()
    if (!trimmed || !accessToken) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      socialApi.searchPublicUsers(trimmed)
        .then((results) => { setSearchResults(results) })
        .catch(() => { setSearchResults([]) })
        .finally(() => { setIsSearching(false) })
    }, 300)

    return () => { clearTimeout(timer) }
  }, [searchQuery, accessToken])

  useEffect(() => {
    if (!isConfirmRoute) {
      return
    }

    setTab('login')

    const query = new URLSearchParams(window.location.search)
    const status = query.get('status')
    const emailFromQuery = query.get('email')?.trim()

    if (emailFromQuery) {
      setLoginEmail(emailFromQuery)
    }

    if (status === 'success') {
      setNotice({ text: 'Email confirmed successfully. You can now log in.', type: 'success' })
      return
    }

    if (status === 'error') {
      const reason = query.get('reason')?.trim()
      setNotice({
        text: reason || 'Invalid or expired activation token.',
        type: 'error',
      })
      return
    }

    setNotice({ text: 'Please log in to continue.', type: 'info' })
  }, [isConfirmRoute])

  const register = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const validationError = validateRegisterInput()
    if (validationError) {
      showNotice(validationError, 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.register({
        email: registerEmail,
        password: registerPassword,
        displayName: registerDisplayName,
      })
      showNotice('Registration successful. Please check your email to activate your account.', 'success')
      setLoginEmail(registerEmail.trim())
      setRegisterPassword('')
      setTab('login')
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const login = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!loginEmail.trim()) {
      showNotice('Email is required.', 'error')
      return
    }

    if (!loginPassword) {
      showNotice('Password is required.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authApi.login({ email: loginEmail, password: loginPassword })
      setAccessToken(response.accessToken)
      setLoginPassword('')
      showNotice('Login successful. Welcome back.', 'success')
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = (): void => {
    emitDrawLeave()
    disconnectDrawbackSocket()
    authApi.logout()
    setAccessToken(null)
    resetDashboardData()
    showNotice('You have been logged out.', 'info')
  }

  useEffect(() => {
    const handleUnauthorized = (): void => {
      logout()
    }
    window.addEventListener('drawback:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('drawback:unauthorized', handleUnauthorized)
    }
  }, [])

  const updateProfile = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const displayName = profileDisplayName.trim()
    if (!isValidDisplayName(displayName)) {
      showNotice('Display name must match ^@[a-zA-Z0-9_]{3,29}$.', 'error')
      return
    }

    setIsUpdatingProfile(true)
    try {
      const updatedProfile = await socialApi.updateMyProfile({ displayName })
      const updatedMode = await socialApi.updateMyMode(profileMode)

      setProfile(updatedMode)
      setProfileDisplayName(updatedProfile.displayName)
      setProfileMode(updatedMode.mode)
      showNotice('Profile updated successfully.', 'success')
      await loadDashboardData(false)
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const deleteMyAccount = async (): Promise<void> => {
    const confirmed = typeof window !== 'undefined' ? window.confirm('Delete your account permanently? This cannot be undone.') : false
    if (!confirmed) {
      return
    }

    setIsDeletingAccount(true)
    try {
      await socialApi.deleteMyAccount()
      authApi.logout()
      setAccessToken(null)
      resetDashboardData()
      setTab('login')
      showNotice('Your account has been deleted.', 'info')
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const withAction = async (key: string, action: () => Promise<void>): Promise<void> => {
    setActiveActionKey(key)
    try {
      await action()
    } finally {
      setActiveActionKey(null)
    }
  }

  const sendRequest = async (toDisplayName: string): Promise<void> => {
    await withAction(`request:${toDisplayName}`, async () => {
      try {
        await socialApi.sendChatRequest(toDisplayName)
        showNotice('Chat request sent.', 'success')
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  const openChat = (chatRequestId: string): void => {
    setClosedRecentChatRequestIds((previous) => {
      if (!previous.has(chatRequestId)) {
        return previous
      }

      const next = new Set(previous)
      next.delete(chatRequestId)
      return next
    })
    setWaitingPeerRequestIds((previous) => {
      if (!previous.has(chatRequestId)) {
        return previous
      }
      const next = new Set(previous)
      next.delete(chatRequestId)
      return next
    })
    setCenterView('chat')
    setSelectedChatRequestId(chatRequestId)
  }

  const closeRecentChat = (chatRequestId: string): void => {
    setClosedRecentChatRequestIds((previous) => {
      if (previous.has(chatRequestId)) {
        return previous
      }

      const next = new Set(previous)
      next.add(chatRequestId)
      return next
    })

    if (selectedChatRequestId === chatRequestId) {
      setSelectedChatRequestId(null)
    }
  }

  const getNormalizedPointFromPointerEvent = (event: ReactPointerEvent<HTMLCanvasElement>): NormalizedPoint => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return { x: 0, y: 0 }
    }

    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    return {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    }
  }

  const handleLocalCanvasPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!selectedChatRequestId || joinedChatRequestId !== selectedChatRequestId || !peerPresent) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    localLastPointRef.current = getNormalizedPointFromPointerEvent(event)
  }

  const handleLocalCanvasPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!selectedChatRequestId || joinedChatRequestId !== selectedChatRequestId || !peerPresent) {
      return
    }

    if (!localLastPointRef.current) {
      return
    }

    const nextPoint = getNormalizedPointFromPointerEvent(event)
    const stroke: DrawSegmentStroke = {
      kind: 'segment',
      from: localLastPointRef.current,
      to: nextPoint,
      color: drawColor,
      width: drawColor === 'eraser' ? ERASER_WIDTH : DRAW_WIDTH,
    }

    drawSegmentOnCanvas(localCanvasRef.current, stroke)
    emitDrawStroke(selectedChatRequestId, stroke)
    localLastPointRef.current = nextPoint
  }

  const stopLocalDrawing = (): void => {
    localLastPointRef.current = null
  }

  const clearLocalCanvasAndNotify = (): void => {
    if (!selectedChatRequestId || joinedChatRequestId !== selectedChatRequestId || !peerPresent) {
      return
    }

    clearCanvas(localCanvasRef.current)
    emitDrawClear(selectedChatRequestId)
  }

  const reconnectToRoom = (): void => {
    if (!selectedChatRequestId) {
      return
    }

    setIsReconnecting(true)
    setShowReconnectButton(false)
    emitChatJoin(selectedChatRequestId)
    setTimeout(() => setIsReconnecting(false), 3000)
  }

  const cancelRequest = async (chatRequestId: string): Promise<void> => {
    await withAction(`cancel-request:${chatRequestId}`, async () => {
      try {
        await socialApi.cancelChatRequest(chatRequestId)
        showNotice('Chat request canceled.', 'info')
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  const respondToRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<void> => {
    await withAction(`request-status:${requestId}:${status}`, async () => {
      try {
        const response = await socialApi.respondToChatRequest(requestId, status === 'ACCEPTED')
        showNotice(status === 'ACCEPTED' ? 'Chat request accepted.' : 'Chat request rejected.', 'success')
        if (status === 'ACCEPTED') {
          emitChatJoin(response.request.id)
          openChat(response.request.id)
        }
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  const saveAcceptedChat = async (chatRequestId: string): Promise<void> => {
    await withAction(`save-chat:${chatRequestId}`, async () => {
      try {
        await socialApi.saveChat(chatRequestId)
        showNotice('Chat saved.', 'success')
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  const removeSavedChat = async (savedChatId: string): Promise<void> => {
    await withAction(`delete-chat:${savedChatId}`, async () => {
      try {
        await socialApi.deleteSavedChat(savedChatId)
        showNotice('Saved chat deleted.', 'info')
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  const blockUser = async (blockedUserId: string): Promise<void> => {
    await withAction(`block:${blockedUserId}`, async () => {
      try {
        await socialApi.blockUser(blockedUserId)
        showNotice('User blocked.', 'info')
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  const unblockUser = async (blockedUserId: string): Promise<void> => {
    await withAction(`unblock:${blockedUserId}`, async () => {
      try {
        await socialApi.unblockUser(blockedUserId)
        showNotice('User unblocked.', 'success')
        await loadDashboardData(false)
      } catch (error) {
        showNotice(mapErrorToMessage(error), 'error')
      }
    })
  }

  useEffect(() => {
    if (!accessToken) {
      return
    }

    void loadDashboardData(true)
  }, [accessToken])

  useEffect(() => {
    selectedChatRequestIdRef.current = selectedChatRequestId
  }, [selectedChatRequestId])

  useEffect(() => {
    localLastPointRef.current = null
    setJoinedChatRequestId(null)
    setPeerPresent(false)
    clearCanvas(localCanvasRef.current)
    clearCanvas(remoteCanvasRef.current)
  }, [selectedChatRequestId])

  useEffect(() => {
    if (!selectedChatRequestId || !accessToken) {
      return
    }

    emitChatJoin(selectedChatRequestId)
  }, [selectedChatRequestId, accessToken])

  useEffect(() => {
    if (peerPresent || !joinedChatRequestId) {
      setShowReconnectButton(false)
      return
    }

    const timer = setTimeout(() => {
      setShowReconnectButton(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [joinedChatRequestId, peerPresent])

  useEffect(() => {
    if (!accessToken) {
      disconnectDrawbackSocket()
      return
    }

    let socket
    try {
      socket = getOrCreateDrawbackSocket(backendUrl, accessToken)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize realtime connection.'
      showNotice(message, 'error')
      return
    }

    const onChatRequested = (payload: { fromUser: { displayName: string } }) => {
      showNotice(`${payload.fromUser.displayName} sent you a chat request.`, 'info')
      void loadDashboardDataRef.current(false)
    }

    const onChatResponse = (payload: { accepted: boolean; requestId: string }) => {
      if (payload.accepted) {
        emitChatJoin(payload.requestId)
      }
      void loadDashboardDataRef.current(false)
    }

    const onChatJoined = (payload: { requestId: string; peers: string[] }) => {
      setJoinedChatRequestId(payload.requestId)
      openChat(payload.requestId)
      if (payload.peers.length > 0) {
        setPeerPresent(true)
      }
    }

    const onDrawStroke = (payload: { requestId: string; stroke: unknown }) => {
      if (!isDrawSegmentStroke(payload.stroke)) {
        return
      }

      if (payload.requestId !== selectedChatRequestIdRef.current) {
        return
      }

      drawSegmentOnCanvas(remoteCanvasRef.current, payload.stroke)
    }

    const onDrawClear = (payload: { requestId: string }) => {
      if (payload.requestId !== selectedChatRequestIdRef.current) {
        return
      }

      clearCanvas(remoteCanvasRef.current)
    }

    const onDrawPeerJoined = () => {
      setPeerPresent(true)
    }

    const onDrawPeerLeft = () => {
      setPeerPresent(false)
    }

    const onDrawPeerWaiting = (payload: { requestId: string }) => {
      setWaitingPeerRequestIds((previous) => {
        if (previous.has(payload.requestId)) {
          return previous
        }
        return new Set(previous).add(payload.requestId)
      })
    }

    const onSocketError = (payload: { message: string; status?: number }) => {
      const statusPrefix = payload.status ? `[WS ${payload.status}] ` : ''
      showNotice(`${statusPrefix}${payload.message}`, 'error')
    }

    const onConnectError = (error: Error) => {
      if (error.message === 'Unauthorized') {
        disconnectDrawbackSocket()
        authApi.logout()
        setAccessToken(null)
        resetDashboardData()
        showNotice('Session expired. Please log in again.', 'error')
        return
      }

      showNotice(`Realtime connection failed: ${error.message}`, 'error')
    }

    socket.on('chat.requested', onChatRequested)
    socket.on('chat.response', onChatResponse)
    socket.on('chat.joined', onChatJoined)
    socket.on('draw.peer.joined', onDrawPeerJoined)
    socket.on('draw.peer.left', onDrawPeerLeft)
    socket.on('draw.peer.waiting', onDrawPeerWaiting)
    socket.on('draw.stroke', onDrawStroke)
    socket.on('draw.clear', onDrawClear)
    socket.on('error', onSocketError)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('chat.requested', onChatRequested)
      socket.off('chat.response', onChatResponse)
      socket.off('chat.joined', onChatJoined)
      socket.off('draw.peer.joined', onDrawPeerJoined)
      socket.off('draw.peer.left', onDrawPeerLeft)
      socket.off('draw.peer.waiting', onDrawPeerWaiting)
      socket.off('draw.stroke', onDrawStroke)
      socket.off('draw.clear', onDrawClear)
      socket.off('error', onSocketError)
      socket.off('connect_error', onConnectError)
    }
  }, [accessToken, authApi, backendUrl])

  useEffect(() => {
    return () => {
      disconnectDrawbackSocket()
    }
  }, [])

  const currentUserId = profile?.id

  const incomingRequests = chatRequests.filter((request) => request.toUserId === currentUserId)
  const outgoingRequests = chatRequests.filter((request) => request.fromUserId === currentUserId)
  const pendingIncomingRequests = incomingRequests.filter((request) => request.status === 'PENDING')
  const pendingOutgoingRequests = outgoingRequests.filter((request) => request.status === 'PENDING')

  const blockedUserIdSet = new Set(blockedUsers.map((entry) => entry.id))

  const recentChats = chatRequests.filter(
    (request) =>
      request.status === 'ACCEPTED' &&
      !blockedUserIdSet.has(request.fromUserId) &&
      !blockedUserIdSet.has(request.toUserId),
  )

  const getOtherUser = (request: ChatRequest): { id: string; displayName: string } => {
    if (request.fromUserId === currentUserId) {
      return { id: request.toUser.id, displayName: request.toUser.displayName }
    }
    return { id: request.fromUser.id, displayName: request.fromUser.displayName }
  }

  const pendingOutgoingByUserId = new Map(pendingOutgoingRequests.map((request) => [request.toUserId, request]))
  const pendingOutgoingUserIds = new Set(pendingOutgoingRequests.map((request) => request.toUserId))

  const savedRequestIdSet = new Set(savedChats.map((chat) => chat.chatRequestId))

  const searchTerm = searchQuery.trim().toLowerCase()
  const includesSearch = (value: string): boolean => !searchTerm || value.toLowerCase().includes(searchTerm)

  const filteredRecentChats = recentChats.filter((chat) => !closedRecentChatRequestIds.has(chat.id) && includesSearch(getOtherUser(chat).displayName))
  const filteredChatRequests = chatRequests.filter((request) => {
    const other = getOtherUser(request)
    return request.status !== 'ACCEPTED' && includesSearch(`${other.displayName} ${request.status}`)
  })
  const filteredSavedChats = savedChats.filter(
    (savedChat) =>
      !blockedUserIdSet.has(savedChat.chatRequest.fromUserId) &&
      !blockedUserIdSet.has(savedChat.chatRequest.toUserId) &&
      includesSearch(getOtherUser(savedChat.chatRequest).displayName),
  )
  const filteredBlockedUsers = blockedUsers.filter((user) => includesSearch(`${user.displayName} ${user.email}`))

  const selectedChat = selectedChatRequestId ? recentChats.find((chat) => chat.id === selectedChatRequestId) ?? null : null
  const acceptedChatByUserId = new Map(recentChats.map((chat) => [getOtherUser(chat).id, chat.id]))

  useEffect(() => {
    if (!selectedChatRequestId) {
      return
    }

    if (!recentChats.some((chat) => chat.id === selectedChatRequestId)) {
      setSelectedChatRequestId(null)
    }
  }, [selectedChatRequestId, recentChats])

  useEffect(() => {
    const recentChatIdSet = new Set(recentChats.map((chat) => chat.id))
    setClosedRecentChatRequestIds((previous) => {
      const next = new Set(Array.from(previous).filter((chatRequestId) => recentChatIdSet.has(chatRequestId)))
      if (next.size === previous.size) {
        return previous
      }
      return next
    })
  }, [recentChats])

  return (
    <AuthModuleView
      accessToken={accessToken}
      isConfirmRoute={isConfirmRoute}
      tab={tab}
      setTab={setTab}
      register={register}
      login={login}
      registerEmail={registerEmail}
      setRegisterEmail={setRegisterEmail}
      registerPassword={registerPassword}
      setRegisterPassword={setRegisterPassword}
      registerDisplayName={registerDisplayName}
      setRegisterDisplayName={setRegisterDisplayName}
      normalizeRegisterDisplayNameInput={normalizeRegisterDisplayNameInput}
      loginEmail={loginEmail}
      setLoginEmail={setLoginEmail}
      loginPassword={loginPassword}
      setLoginPassword={setLoginPassword}
      isSubmitting={isSubmitting}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchResults={searchResults}
      isSearching={isSearching}
      sendRequest={sendRequest}
      pendingOutgoingUserIds={pendingOutgoingUserIds}
      profile={profile}
      activeActionKey={activeActionKey}
      cancelRequest={cancelRequest}
      blockUser={blockUser}
      unblockUser={unblockUser}
      filteredRecentChats={filteredRecentChats}
      getOtherUser={getOtherUser}
      selectedChatRequestId={selectedChatRequestId}
      waitingPeerRequestIds={waitingPeerRequestIds}
      openChat={openChat}
      closeRecentChat={closeRecentChat}
      filteredChatRequests={filteredChatRequests}
      currentUserId={currentUserId}
      respondToRequest={respondToRequest}
      filteredSavedChats={filteredSavedChats}
      removeSavedChat={removeSavedChat}
      filteredBlockedUsers={filteredBlockedUsers}
      setCenterView={setCenterView}
      logout={logout}
      isDashboardLoading={isDashboardLoading}
      centerView={centerView}
      updateProfile={updateProfile}
      profileDisplayName={profileDisplayName}
      setProfileDisplayName={setProfileDisplayName}
      normalizeProfileDisplayNameInput={normalizeProfileDisplayNameInput}
      profileMode={profileMode}
      setProfileMode={setProfileMode}
      isUpdatingProfile={isUpdatingProfile}
      deleteMyAccount={deleteMyAccount}
      isDeletingAccount={isDeletingAccount}
      selectedChat={selectedChat}
      joinedChatRequestId={joinedChatRequestId}
      peerPresent={peerPresent}
      showReconnectButton={showReconnectButton}
      isReconnecting={isReconnecting}
      reconnectToRoom={reconnectToRoom}
      clearLocalCanvasAndNotify={clearLocalCanvasAndNotify}
      savedRequestIdSet={savedRequestIdSet}
      saveAcceptedChat={saveAcceptedChat}
      localCanvasRef={localCanvasRef}
      remoteCanvasRef={remoteCanvasRef}
      handleLocalCanvasPointerDown={handleLocalCanvasPointerDown}
      handleLocalCanvasPointerMove={handleLocalCanvasPointerMove}
      stopLocalDrawing={stopLocalDrawing}
      drawColor={drawColor}
      setDrawColor={setDrawColor}
      presetColors={PRESET_COLORS}
      notice={notice}
    />
  )
}
