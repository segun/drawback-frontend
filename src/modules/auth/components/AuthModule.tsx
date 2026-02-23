import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../../common/api/apiError'
import { NoticeBanner, type Notice } from '../../../common/components/NoticeBanner'
import { createAuthApi } from '../api/authApi'
import { type BlockedUser, type ChatRequest, createSocialApi, type SavedChat, type UserMode, type UserProfile } from '../api/socialApi'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants'
import { isValidDisplayName } from '../utils/displayName'

type AuthTab = 'register' | 'login'
type CenterView = 'chat' | 'profile'

export function AuthModule() {
  const authApi = useMemo(() => createAuthApi(String(import.meta.env.VITE_BACKEND_URL ?? '').trim()), [])
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

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileDisplayName, setProfileDisplayName] = useState('@')
  const [profileMode, setProfileMode] = useState<UserMode>('PRIVATE')
  const [publicUsers, setPublicUsers] = useState<UserProfile[]>([])
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([])
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])

  const showNotice = (text: string, type: Notice['type'] = 'info'): void => {
    setNotice({ text, type })
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
          setCenterView('chat')
          setSelectedChatRequestId(response.request.id)
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
  const filteredRecentChats = recentChats.filter((chat) => includesSearch(getOtherUser(chat).displayName))
  const filteredChatRequests = chatRequests.filter((request) => {
    const other = getOtherUser(request)
    return includesSearch(`${other.displayName} ${request.status}`)
  })
  const filteredSavedChats = savedChats.filter((savedChat) => includesSearch(getOtherUser(savedChat.chatRequest).displayName))
  const filteredBlockedUsers = blockedUsers.filter((user) => includesSearch(`${user.displayName} ${user.email}`))

  const selectedChat = selectedChatRequestId ? recentChats.find((chat) => chat.id === selectedChatRequestId) ?? null : null

  useEffect(() => {
    if (!selectedChatRequestId) {
      return
    }

    if (!recentChats.some((chat) => chat.id === selectedChatRequestId)) {
      setSelectedChatRequestId(null)
    }
  }, [selectedChatRequestId, recentChats])

  return (
    <main className="min-h-screen bg-rose-0 text-rose-800">
      <header className="mb-6 border-b border-rose-300 bg-rose-200/80">
        <nav className={`mx-auto flex w-full items-center justify-between px-4 py-3 ${accessToken ? 'max-w-4xl' : 'max-w-xl'}`}>
          <img src="/images/logo/logo_main.jpg" alt="DrawkcaB logo" className="h-12 w-36 rounded-md border border-rose-300 object-cover" />
          <span className="rounded-md border border-rose-400 bg-rose-300 px-3 py-1 text-sm font-medium">
            {accessToken ? 'Signed in' : 'Signed out'}
          </span>
        </nav>
      </header>

      <div className={`mx-auto px-4 pb-8 ${accessToken ? 'max-w-4xl' : 'max-w-xl'}`}>
        <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          {!accessToken && (
            <>
              <h1 className="mb-2 text-xl font-semibold">Auth</h1>
              <p className="mb-4 text-sm text-rose-700">Register with email, password, and display name. Login is allowed only after email confirmation.</p>
            </>
          )}

          {accessToken && <h1 className="mb-2 text-xl font-semibold">Chat</h1>}

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
            <div className="mt-4 grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
              <aside className="flex h-[calc(100vh-14rem)] min-h-[36rem] flex-col rounded-md border border-rose-300 bg-rose-200">
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

                        return (
                          <li key={user.id} className="rounded-md border border-rose-300 bg-rose-100 p-2">
                            <div className="mb-2 text-sm text-rose-700">{user.displayName}</div>
                            {!isSelf && (
                              <div className="flex flex-wrap gap-2">
                                {!pendingRequest && !isBlocked && (
                                  <button
                                    type="button"
                                    onClick={() => void sendRequest(user.displayName)}
                                    disabled={activeActionKey === `request:${user.displayName}`}
                                    className="rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-xs font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                                  >
                                    {activeActionKey === `request:${user.displayName}` ? 'Sending…' : 'Send Request'}
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
                            <button
                              type="button"
                              onClick={() => {
                                setCenterView('chat')
                                setSelectedChatRequestId(chat.id)
                              }}
                              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                                isActive ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                              }`}
                            >
                              {other.displayName}
                            </button>
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
                              onClick={() => {
                                setCenterView('chat')
                                setSelectedChatRequestId(savedChat.chatRequestId)
                              }}
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

              <section className="rounded-md border border-rose-300 bg-rose-200 p-4">
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
                  <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
                    {!selectedChat && (
                      <div className="flex min-h-[20rem] w-full items-center justify-center rounded-md border border-rose-300 bg-rose-100 p-6 text-center">
                        <div>
                          <h2 className="mb-2 text-lg font-semibold">Start a conversation</h2>
                          <p className="text-sm text-rose-700">Select a recent chat from the left to open your chat canvases.</p>
                        </div>
                      </div>
                    )}

                    {selectedChat && (
                      <div className="w-full">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <h2 className="text-base font-semibold">Chat with {getOtherUser(selectedChat).displayName}</h2>
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

                        <div className="flex flex-col gap-4">
                          <div className="rounded-md border border-rose-300 bg-rose-100 p-3">
                            <p className="mb-2 text-xs text-rose-700">Canvas 1</p>
                            <canvas className="h-64 w-full rounded-md border border-rose-300 bg-rose-50" />
                          </div>
                          <div className="rounded-md border border-rose-300 bg-rose-100 p-3">
                            <p className="mb-2 text-xs text-rose-700">Canvas 2</p>
                            <canvas className="h-64 w-full rounded-md border border-rose-300 bg-rose-50" />
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
