import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { ApiError } from '../../../common/api/apiError'
import { NoticeBanner, type Notice } from '../../../common/components/NoticeBanner'
import { disconnectDrawbackSocket, emitChatJoin, emitDrawClear, emitDrawLeave, emitDrawStroke, getOrCreateDrawbackSocket } from '../../../common/realtime/drawbackSocket'
import { createAuthApi } from '../api/authApi'
import { type BlockedUser, type ChatRequest, createSocialApi, type SavedChat, type UserMode, type UserProfile } from '../api/socialApi'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants'
import { isValidDisplayName } from '../utils/displayName'

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

const DRAW_COLOR = '#be123c'
const DRAW_WIDTH = 2

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
  const [closedRecentChatRequestIds, setClosedRecentChatRequestIds] = useState<Set<string>>(new Set())

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileDisplayName, setProfileDisplayName] = useState('@')
  const [profileMode, setProfileMode] = useState<UserMode>('PRIVATE')
  const [publicUsers, setPublicUsers] = useState<UserProfile[]>([])
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([])
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const loadDashboardDataRef = useRef<(showLoading?: boolean) => Promise<void>>(async () => {})
  const selectedChatRequestIdRef = useRef<string | null>(null)
  const localCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const remoteCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const localLastPointRef = useRef<NormalizedPoint | null>(null)

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

    context.strokeStyle = stroke.color
    context.lineWidth = stroke.width
    context.beginPath()
    context.moveTo(stroke.from.x * width, stroke.from.y * height)
    context.lineTo(stroke.to.x * width, stroke.to.y * height)
    context.stroke()
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
    setPublicUsers([])
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
      const [me, users, sentRequests, receivedRequests, chats, blocks] = await Promise.all([
        socialApi.getMyProfile(),
        socialApi.listPublicUsers(),
        socialApi.listSentChatRequests(),
        socialApi.listReceivedChatRequests(),
        socialApi.listSavedChats(),
        socialApi.listBlockedUsers(),
      ])

      setProfile(me)
      setProfileDisplayName(me.displayName)
      setProfileMode(me.mode)
      setPublicUsers(users)
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
    if (!selectedChatRequestId || joinedChatRequestId !== selectedChatRequestId) {
      return
    }

    event.currentTarget.setPointerCapture(event.pointerId)
    localLastPointRef.current = getNormalizedPointFromPointerEvent(event)
  }

  const handleLocalCanvasPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!selectedChatRequestId || joinedChatRequestId !== selectedChatRequestId) {
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
      color: DRAW_COLOR,
      width: DRAW_WIDTH,
    }

    drawSegmentOnCanvas(localCanvasRef.current, stroke)
    emitDrawStroke(selectedChatRequestId, stroke)
    localLastPointRef.current = nextPoint
  }

  const stopLocalDrawing = (): void => {
    localLastPointRef.current = null
  }

  const clearLocalCanvasAndNotify = (): void => {
    if (!selectedChatRequestId || joinedChatRequestId !== selectedChatRequestId) {
      return
    }

    clearCanvas(localCanvasRef.current)
    emitDrawClear(selectedChatRequestId)
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

    const onChatJoined = (payload: { requestId: string }) => {
      setJoinedChatRequestId(payload.requestId)
      openChat(payload.requestId)
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
    socket.on('draw.stroke', onDrawStroke)
    socket.on('draw.clear', onDrawClear)
    socket.on('error', onSocketError)
    socket.on('connect_error', onConnectError)

    return () => {
      socket.off('chat.requested', onChatRequested)
      socket.off('chat.response', onChatResponse)
      socket.off('chat.joined', onChatJoined)
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
  const recentChats = chatRequests.filter((request) => request.status === 'ACCEPTED')

  const getOtherUser = (request: ChatRequest): { id: string; displayName: string } => {
    if (request.fromUserId === currentUserId) {
      return { id: request.toUser.id, displayName: request.toUser.displayName }
    }
    return { id: request.fromUser.id, displayName: request.fromUser.displayName }
  }

  const blockedUserIdSet = new Set(blockedUsers.map((entry) => entry.id))

  const pendingOutgoingByUserId = new Map(pendingOutgoingRequests.map((request) => [request.toUserId, request]))

  const savedRequestIdSet = new Set(savedChats.map((chat) => chat.chatRequestId))

  const searchTerm = searchQuery.trim().toLowerCase()
  const includesSearch = (value: string): boolean => !searchTerm || value.toLowerCase().includes(searchTerm)

  const filteredPublicUsers = publicUsers.filter((user) => includesSearch(`${user.displayName} ${user.email}`))
  const filteredRecentChats = recentChats.filter((chat) => !closedRecentChatRequestIds.has(chat.id) && includesSearch(getOtherUser(chat).displayName))
  const filteredChatRequests = chatRequests.filter((request) => {
    const other = getOtherUser(request)
    return includesSearch(`${other.displayName} ${request.status}`)
  })
  const filteredSavedChats = savedChats.filter((savedChat) => includesSearch(getOtherUser(savedChat.chatRequest).displayName))
  const filteredBlockedUsers = blockedUsers.filter((user) => includesSearch(`${user.displayName} ${user.email}`))

  const selectedChat = selectedChatRequestId ? recentChats.find((chat) => chat.id === selectedChatRequestId) ?? null : null
  const acceptedChatByUserId = new Set(recentChats.map((chat) => getOtherUser(chat).id))

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
    <main className={`bg-rose-0 text-rose-800 ${accessToken ? 'flex h-screen flex-col overflow-hidden' : 'min-h-screen'}`}>
      <header className={`${accessToken ? 'border-b border-rose-300 bg-rose-200/80' : 'mb-6 border-b border-rose-300 bg-rose-200/80'}`}>
        <nav className={`mx-auto flex w-full items-center justify-between ${accessToken ? 'max-w-4xl px-1 py-2' : 'max-w-xl px-4 py-3'}`}>
          <img
            src="/images/logo/logo_main.jpg"
            alt="DrawkcaB logo"
            className={`${accessToken ? 'h-10 w-32' : 'h-12 w-36'} rounded-md border border-rose-300 object-cover`}
          />
          <span className="rounded-md border border-rose-400 bg-rose-300 px-3 py-1 text-sm font-medium">
            {accessToken ? 'Signed in' : 'Signed out'}
          </span>
        </nav>
      </header>

      <div className={`mx-auto px-4 ${accessToken ? 'flex-1 min-h-0 max-w-4xl w-full overflow-hidden pb-3 pt-2' : 'max-w-xl pb-8'}`}>
        <section
          className={
            accessToken
              ? 'w-full'
              : 'rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30'
          }
        >
          {!accessToken && (
            <>
              <p className="mb-4 text-sm text-rose-700">Register with email, password, and display name. Login is allowed only after email confirmation.</p>
            </>
          )}

          {!accessToken && !isConfirmRoute && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  tab === 'register' ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  tab === 'login' ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                }`}
              >
                Login
              </button>
            </div>
          )}

          {!accessToken && tab === 'register' && (
            <form className="flex flex-col gap-3" onSubmit={register}>
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  type="email"
                  value={registerEmail}
                  maxLength={EMAIL_MAX}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="alice@example.com"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Password
                <input
                  type="password"
                  value={registerPassword}
                  minLength={PASSWORD_MIN}
                  maxLength={PASSWORD_MAX}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Display name
                <input
                  type="text"
                  value={registerDisplayName}
                  onChange={(event) => setRegisterDisplayName(normalizeRegisterDisplayNameInput(event.target.value))}
                  placeholder="@alice"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <p className="text-xs text-rose-600">Must match ^@[a-zA-Z0-9_]{'{'}3,29{'}'}$</p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Registering…' : 'Create account'}
              </button>
            </form>
          )}

          {!accessToken && tab === 'login' && (
            <form className="flex flex-col gap-3" onSubmit={login}>
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  type="email"
                  value={loginEmail}
                  maxLength={EMAIL_MAX}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="alice@example.com"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Password
                <input
                  type="password"
                  value={loginPassword}
                  maxLength={PASSWORD_MAX}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Your password"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>

              {isConfirmRoute && (
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.assign('/')
                    }
                  }}
                  className="text-left text-sm font-medium text-rose-700 underline underline-offset-2 hover:text-rose-800"
                >
                  Need an account? Go to Register
                </button>
              )}

            </form>
          )}

          {accessToken && (
            <div className="mt-2 grid h-[calc(100%-0.5rem)] w-full gap-4 overflow-hidden lg:grid-cols-[20rem_minmax(0,1fr)]">
              <aside className="flex h-full min-h-0 flex-col rounded-md border border-rose-300 bg-rose-200">
                <div className="border-b border-rose-300 p-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search chats, users, requests, saved, blocked"
                    className="w-full rounded-md border border-rose-300 bg-rose-100 px-3 py-2 text-sm outline-none placeholder:text-rose-500 focus:border-rose-600"
                  />
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Public Users</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredPublicUsers.map((user) => {
                        const isSelf = user.id === profile?.id
                        const isBlocked = blockedUserIdSet.has(user.id)
                        const pendingRequest = pendingOutgoingByUserId.get(user.id)
                        const hasAcceptedChat = acceptedChatByUserId.has(user.id)

                        return (
                          <li key={user.id} className="rounded-md border border-rose-300 bg-rose-100 p-2">
                            <div className="mb-2 text-sm text-rose-700">{user.displayName}</div>
                            {!isSelf && (
                              <div className="flex flex-wrap gap-2">
                                {!pendingRequest && !isBlocked && !hasAcceptedChat && (
                                  <button
                                    type="button"
                                    onClick={() => void sendRequest(user.displayName)}
                                    disabled={activeActionKey === `request:${user.displayName}`}
                                    className="rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `request:${user.displayName}` ? 'Sending…' : 'Send Request'}
                                  </button>
                                )}

                                {hasAcceptedChat && !pendingRequest && !isBlocked && (
                                  <button
                                    type="button"
                                    disabled
                                    className="rounded-md border border-rose-400 bg-rose-300 px-3 py-1 text-xs font-medium text-rose-700 disabled:cursor-not-allowed disabled:opacity-80"
                                  >
                                    Already chatting
                                  </button>
                                )}

                                {pendingRequest && (
                                  <button
                                    type="button"
                                    onClick={() => void cancelRequest(pendingRequest.id)}
                                    disabled={activeActionKey === `cancel-request:${pendingRequest.id}`}
                                    className="rounded-md border border-red-700 bg-red-700 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `cancel-request:${pendingRequest.id}` ? 'Canceling…' : 'Cancel'}
                                  </button>
                                )}

                                {!isBlocked && (
                                  <button
                                    type="button"
                                    onClick={() => void blockUser(user.id)}
                                    disabled={activeActionKey === `block:${user.id}`}
                                    className="rounded-md border border-rose-700 bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `block:${user.id}` ? 'Blocking…' : 'Block'}
                                  </button>
                                )}

                                {isBlocked && (
                                  <button
                                    type="button"
                                    onClick={() => void unblockUser(user.id)}
                                    disabled={activeActionKey === `unblock:${user.id}`}
                                    className="rounded-md border border-green-700 bg-green-700 px-3 py-1 text-xs font-medium text-green-100 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `unblock:${user.id}` ? 'Unblocking…' : 'Unblock'}
                                  </button>
                                )}
                              </div>
                            )}
                          </li>
                        )
                      })}

                      {filteredPublicUsers.length === 0 && <li className="text-xs text-rose-700">No public users found.</li>}
                    </ul>
                  </section>

                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Recent Chats</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredRecentChats.map((chat) => {
                        const other = getOtherUser(chat)
                        const isActive = selectedChatRequestId === chat.id
                        return (
                          <li key={chat.id}>
                            <div
                              className={`flex items-center gap-2 rounded-md border px-2 py-2 ${
                                isActive ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => openChat(chat.id)}
                                className="min-w-0 flex-1 truncate text-left text-sm"
                              >
                                {other.displayName}
                              </button>
                              <button
                                type="button"
                                onClick={() => closeRecentChat(chat.id)}
                                className={`rounded-md p-1 ${isActive ? 'hover:bg-rose-800' : 'hover:bg-rose-200'}`}
                                aria-label={`Close chat with ${other.displayName}`}
                                title="Close chat"
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                  <path d="M18 6L6 18" />
                                  <path d="M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        )
                      })}

                      {filteredRecentChats.length === 0 && <li className="text-xs text-rose-700">No recent chats.</li>}
                    </ul>
                  </section>

                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Chat Requests</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredChatRequests.map((request) => {
                        const other = getOtherUser(request)
                        const isIncomingPending = request.toUserId === currentUserId && request.status === 'PENDING'
                        const isOutgoingPending = request.fromUserId === currentUserId && request.status === 'PENDING'

                        return (
                          <li key={request.id} className="rounded-md border border-rose-300 bg-rose-100 p-2">
                            <div className="mb-2 text-xs text-rose-700">
                              {other.displayName} — {request.status}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {isIncomingPending && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void respondToRequest(request.id, 'ACCEPTED')}
                                    disabled={activeActionKey === `request-status:${request.id}:ACCEPTED`}
                                    className="rounded-md border border-green-700 bg-green-700 px-3 py-1 text-xs font-medium text-green-100 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `request-status:${request.id}:ACCEPTED` ? 'Accepting…' : 'Accept'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void respondToRequest(request.id, 'REJECTED')}
                                    disabled={activeActionKey === `request-status:${request.id}:REJECTED`}
                                    className="rounded-md border border-red-700 bg-red-700 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `request-status:${request.id}:REJECTED` ? 'Rejecting…' : 'Reject'}
                                  </button>
                                </>
                              )}

                              {isOutgoingPending && (
                                <button
                                  type="button"
                                  onClick={() => void cancelRequest(request.id)}
                                  disabled={activeActionKey === `cancel-request:${request.id}`}
                                  className="rounded-md border border-red-700 bg-red-700 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {activeActionKey === `cancel-request:${request.id}` ? 'Canceling…' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </li>
                        )
                      })}

                      {filteredChatRequests.length === 0 && <li className="text-xs text-rose-700">No chat requests.</li>}
                    </ul>
                  </section>

                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Saved Chats</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredSavedChats.map((savedChat) => (
                        <li key={savedChat.id} className="rounded-md border border-rose-300 bg-rose-100 p-2">
                          <div className="mb-2 text-xs text-rose-700">{getOtherUser(savedChat.chatRequest).displayName}</div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openChat(savedChat.chatRequestId)}
                              className="rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-800"
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={() => void removeSavedChat(savedChat.id)}
                              disabled={activeActionKey === `delete-chat:${savedChat.id}`}
                              className="rounded-md border border-red-700 bg-red-700 px-3 py-1 text-xs font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {activeActionKey === `delete-chat:${savedChat.id}` ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </li>
                      ))}

                      {filteredSavedChats.length === 0 && <li className="text-xs text-rose-700">No saved chats.</li>}
                    </ul>
                  </section>

                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Blocked Users</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredBlockedUsers.map((blockedUser) => (
                        <li key={blockedUser.id} className="rounded-md border border-rose-300 bg-rose-100 p-2">
                          <div className="mb-2 text-xs text-rose-700">{blockedUser.displayName}</div>
                          <button
                            type="button"
                            onClick={() => void unblockUser(blockedUser.id)}
                            disabled={activeActionKey === `unblock:${blockedUser.id}`}
                            className="rounded-md border border-green-700 bg-green-700 px-3 py-1 text-xs font-medium text-green-100 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {activeActionKey === `unblock:${blockedUser.id}` ? 'Unblocking…' : 'Unblock'}
                          </button>
                        </li>
                      ))}

                      {filteredBlockedUsers.length === 0 && <li className="text-xs text-rose-700">No blocked users.</li>}
                    </ul>
                  </section>
                </div>

                <div className="border-t border-rose-300 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="group relative">
                      <button
                        type="button"
                        onClick={() => setCenterView('profile')}
                        aria-label="Profile"
                        title="Profile"
                        className="rounded-md border border-rose-700 bg-rose-700 p-2 text-rose-100 hover:bg-rose-800"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M20 21a8 8 0 0 0-16 0" />
                          <circle cx="12" cy="8" r="4" />
                        </svg>
                      </button>
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-rose-300 bg-rose-100 px-2 py-1 text-xs text-rose-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        Profile
                      </span>
                    </div>

                    <div className="group relative">
                      <button
                        type="button"
                        onClick={logout}
                        aria-label="Logout"
                        title="Logout"
                        className="rounded-md border border-rose-700 bg-rose-100 p-2 text-rose-700 hover:bg-rose-200"
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <path d="M16 17l5-5-5-5" />
                          <path d="M21 12H9" />
                        </svg>
                      </button>
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-rose-300 bg-rose-100 px-2 py-1 text-xs text-rose-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        Logout
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <section className="min-w-0 h-full min-h-0 overflow-hidden rounded-md border border-rose-300 bg-rose-200 p-4">
                {isDashboardLoading && <p className="text-sm text-rose-700">Loading your workspace…</p>}

                {!isDashboardLoading && profile && centerView === 'profile' && (
                  <form className="mx-auto flex w-full max-w-lg flex-col gap-3" onSubmit={updateProfile}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold">My Profile</h2>
                      <button
                        type="button"
                        onClick={() => setCenterView('chat')}
                        className="rounded-md border border-rose-700 bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200"
                      >
                        Back to chat
                      </button>
                    </div>

                    <p className="text-sm text-rose-700">Email: {profile.email}</p>

                    <label className="flex flex-col gap-1 text-sm">
                      Display name
                      <input
                        type="text"
                        value={profileDisplayName}
                        onChange={(event) => setProfileDisplayName(normalizeProfileDisplayNameInput(event.target.value))}
                        className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      Profile visibility
                      <select
                        value={profileMode}
                        onChange={(event) => setProfileMode(event.target.value as UserMode)}
                        className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      >
                        <option value="PRIVATE">Private (default)</option>
                        <option value="PUBLIC">Public</option>
                      </select>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isUpdatingProfile ? 'Saving…' : 'Save profile'}
                      </button>

                      <button
                        type="button"
                        onClick={deleteMyAccount}
                        disabled={isDeletingAccount}
                        className="rounded-md border border-red-700 bg-red-700 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDeletingAccount ? 'Deleting…' : 'Delete account'}
                      </button>
                    </div>
                  </form>
                )}

                {!isDashboardLoading && profile && centerView === 'chat' && (
                  <div className="mx-auto flex h-full min-h-0 w-full max-w-2xl flex-col items-center gap-4 overflow-hidden">
                    {!selectedChat && (
                      <div className="flex min-h-80 w-full items-center justify-center rounded-md border border-rose-300 bg-rose-100 p-6 text-center">
                        <div>
                          <h2 className="mb-2 text-lg font-semibold">Start a conversation</h2>
                          <p className="text-sm text-rose-700">Select a recent chat from the left to open your chat canvases.</p>
                        </div>
                      </div>
                    )}

                    {selectedChat && (
                      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
                        {(() => {
                          const isDrawReady = joinedChatRequestId === selectedChat.id

                          return (
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <h2 className="text-base font-semibold">Chat with {getOtherUser(selectedChat).displayName}</h2>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-md border px-2 py-1 text-[11px] font-medium ${
                                isDrawReady
                                  ? 'border-green-700 bg-green-700 text-green-100'
                                  : 'border-rose-400 bg-rose-300 text-rose-700'
                              }`}
                            >
                              {isDrawReady ? 'Ready' : 'Joining…'}
                            </span>
                            <button
                              type="button"
                              onClick={clearLocalCanvasAndNotify}
                              disabled={joinedChatRequestId !== selectedChat.id}
                              className="rounded-md border border-rose-700 bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Clear mine
                            </button>
                            {!savedRequestIdSet.has(selectedChat.id) && (
                              <button
                                type="button"
                                onClick={() => void saveAcceptedChat(selectedChat.id)}
                                disabled={activeActionKey === `save-chat:${selectedChat.id}`}
                                className="rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {activeActionKey === `save-chat:${selectedChat.id}` ? 'Saving…' : 'Save chat'}
                              </button>
                            )}
                          </div>
                        </div>
                          )
                        })()}

                        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden grid-rows-2">
                          <div className="flex min-h-0 flex-col rounded-md border border-rose-300 bg-rose-100 p-3">
                            <p className="mb-2 text-xs text-rose-700">Canvas 1</p>
                            <canvas
                              ref={localCanvasRef}
                              onPointerDown={handleLocalCanvasPointerDown}
                              onPointerMove={handleLocalCanvasPointerMove}
                              onPointerUp={stopLocalDrawing}
                              onPointerLeave={stopLocalDrawing}
                              onPointerCancel={stopLocalDrawing}
                              className="h-full min-h-0 w-full touch-none rounded-md border border-rose-300 bg-rose-50"
                            />
                          </div>
                          <div className="flex min-h-0 flex-col rounded-md border border-rose-300 bg-rose-100 p-3">
                            <p className="mb-2 text-xs text-rose-700">Canvas 2</p>
                            <canvas ref={remoteCanvasRef} className="h-full min-h-0 w-full rounded-md border border-rose-300 bg-rose-50" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </section>

        <NoticeBanner notice={notice} />
      </div>
    </main>
  )
}
