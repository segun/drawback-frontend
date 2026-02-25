import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Ban, Bookmark, Brush, Eraser, LogOut, Menu, PenLine, Plus, RefreshCw, Save, SaveAll, Send, ShieldOff, SlidersHorizontal, Trash2, User, X } from 'lucide-react'
import { NoticeBanner, type Notice } from '../../../common/components/NoticeBanner'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants'
import type { BlockedUser, ChatRequest, SavedChat, UserMode, UserProfile } from '../api/socialApi'

type AuthTab = 'register' | 'login'
type CenterView = 'chat' | 'profile'

type AuthModuleViewProps = {
  accessToken: string | null
  isConfirmRoute: boolean
  tab: AuthTab
  setTab: (tab: AuthTab) => void
  register: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  login: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  registerEmail: string
  setRegisterEmail: (value: string) => void
  registerPassword: string
  setRegisterPassword: (value: string) => void
  registerDisplayName: string
  setRegisterDisplayName: (value: string) => void
  normalizeRegisterDisplayNameInput: (value: string) => string
  displayNameAvailability: 'idle' | 'invalid' | 'checking' | 'available' | 'taken'
  loginEmail: string
  setLoginEmail: (value: string) => void
  loginPassword: string
  setLoginPassword: (value: string) => void
  isSubmitting: boolean

  searchQuery: string
  setSearchQuery: (value: string) => void
  searchResults: UserProfile[]
  isSearching: boolean
  sendRequest: (displayName: string) => Promise<void>
  pendingOutgoingUserIds: Set<string>
  connectedUserIds: Set<string>
  profile: UserProfile | null
  activeActionKey: string | null
  cancelRequest: (chatRequestId: string) => Promise<void>
  blockUser: (blockedUserId: string) => Promise<void>
  unblockUser: (blockedUserId: string) => Promise<void>

  filteredRecentChats: ChatRequest[]
  getOtherUser: (request: ChatRequest) => { id: string; displayName: string }
  selectedChatRequestId: string | null
  waitingPeerRequestIds: Set<string>
  openChat: (chatRequestId: string) => void
  closeRecentChat: (chatRequestId: string) => void

  filteredChatRequests: ChatRequest[]
  currentUserId?: string
  respondToRequest: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => Promise<void>

  filteredSavedChats: SavedChat[]
  removeSavedChat: (savedChatId: string) => Promise<void>

  filteredBlockedUsers: BlockedUser[]

  setCenterView: (view: CenterView) => void
  logout: () => void

  isDashboardLoading: boolean
  centerView: CenterView
  updateProfile: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  profileDisplayName: string
  setProfileDisplayName: (value: string) => void
  normalizeProfileDisplayNameInput: (value: string) => string
  profileMode: UserMode
  setProfileMode: (mode: UserMode) => void
  appearInSearches: boolean
  setAppearInSearches: (value: boolean) => void
  isUpdatingProfile: boolean
  deleteMyAccount: () => Promise<void>
  isDeletingAccount: boolean

  selectedChat: ChatRequest | null
  joinedChatRequestId: string | null
  peerPresent: boolean
  showReconnectButton: boolean
  isReconnecting: boolean
  reconnectToRoom: () => void
  clearLocalCanvasAndNotify: () => void
  savedRequestIdSet: Set<string>
  saveAcceptedChat: (chatRequestId: string) => Promise<void>

  localCanvasRef: { current: HTMLCanvasElement | null }
  remoteCanvasRef: { current: HTMLCanvasElement | null }
  handleLocalCanvasPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  handleLocalCanvasPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void
  stopLocalDrawing: () => void
  drawColor: string
  setDrawColor: (color: string) => void
  drawStrokeStyle: 'normal' | 'brush'
  setDrawStrokeStyle: (style: 'normal' | 'brush') => void
  drawWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  setDrawWidth: (width: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) => void
  activeEmotes: Array<{ id: string; emoji: string; x: number }>
  activeRemoteEmotes: Array<{ id: string; emoji: string; x: number }>
  sendEmote: (emoji: string) => void
  presetEmotes: string[]

  notice: Notice | null
  onDismissNotice: () => void
}

export function AuthModuleView({
  accessToken,
  isConfirmRoute,
  tab,
  setTab,
  register,
  login,
  registerEmail,
  setRegisterEmail,
  registerPassword,
  setRegisterPassword,
  registerDisplayName,
  setRegisterDisplayName,
  normalizeRegisterDisplayNameInput,
  displayNameAvailability,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  isSubmitting,
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  sendRequest,
  pendingOutgoingUserIds,
  connectedUserIds,
  profile,
  activeActionKey,
  cancelRequest,
  blockUser,
  unblockUser,
  filteredRecentChats,
  getOtherUser,
  selectedChatRequestId,
  waitingPeerRequestIds,
  openChat,
  closeRecentChat,
  filteredChatRequests,
  currentUserId,
  respondToRequest,
  filteredSavedChats,
  removeSavedChat,
  filteredBlockedUsers,
  setCenterView,
  logout,
  isDashboardLoading,
  centerView,
  updateProfile,
  profileDisplayName,
  setProfileDisplayName,
  normalizeProfileDisplayNameInput,
  profileMode,
  setProfileMode,
  appearInSearches,
  setAppearInSearches,
  isUpdatingProfile,
  deleteMyAccount,
  isDeletingAccount,
  selectedChat,
  joinedChatRequestId,
  peerPresent,
  showReconnectButton,
  isReconnecting,
  reconnectToRoom,
  clearLocalCanvasAndNotify,
  savedRequestIdSet,
  saveAcceptedChat,
  localCanvasRef,
  remoteCanvasRef,
  handleLocalCanvasPointerDown,
  handleLocalCanvasPointerMove,
  stopLocalDrawing,
  drawColor,
  setDrawColor,
  drawStrokeStyle,
  setDrawStrokeStyle,
  drawWidth,
  setDrawWidth,
  activeEmotes,
  activeRemoteEmotes,
  sendEmote,
  presetEmotes,
  notice,
  onDismissNotice,
}: AuthModuleViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [confirmDeleteChat, setConfirmDeleteChat] = useState<{ id: string; displayName: string } | null>(null)
  const [confirmBlockUser, setConfirmBlockUser] = useState<{ id: string; displayName: string } | null>(null)
  const [confirmUnblockUser, setConfirmUnblockUser] = useState<{ id: string; displayName: string } | null>(null)
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [newRequestDisplayName, setNewRequestDisplayName] = useState('@')
  const [isSubmittingNewRequest, setIsSubmittingNewRequest] = useState(false)
  const [showEmotePicker, setShowEmotePicker] = useState(false)
  const [showBrushSettings, setShowBrushSettings] = useState(false)

  const presetColors = useMemo(() => [
    '#e11d48',
    '#fb7185',
    '#f59e0b',
    '#10b981',
    '#0ea5e9',
  ], [])

  useEffect(() => {
    if (!showBrushSettings) {
      return undefined
    }

    const handleOutsideClick = () => {
      setShowBrushSettings(false)
    }

    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [showBrushSettings])

  const handleOpenChat = (chatRequestId: string) => {
    openChat(chatRequestId)
    setIsSidebarOpen(false)
  }

  const newRequestTarget = newRequestDisplayName.trim().toLowerCase()
  const newRequestIsSelf =
    newRequestTarget.length > 1 && profile?.displayName.toLowerCase() === newRequestTarget
  const newRequestIsAlreadyConnected =
    newRequestTarget.length > 1 &&
    filteredRecentChats.some((chat) => getOtherUser(chat).displayName.toLowerCase() === newRequestTarget)
  const newRequestHasPending =
    newRequestTarget.length > 1 &&
    filteredChatRequests.some(
      (req) =>
        req.fromUserId === currentUserId &&
        req.status === 'PENDING' &&
        getOtherUser(req).displayName.toLowerCase() === newRequestTarget,
    )

  return (
    <main className={`bg-rose-0 text-rose-800 ${accessToken ? 'flex h-dvh flex-col overflow-hidden landscape:max-lg:h-auto landscape:max-lg:overflow-y-auto' : 'min-h-dvh'}`}>
      <header className={`${accessToken ? 'border-b border-rose-300 bg-rose-200/80' : 'mb-6 border-b border-rose-300 bg-rose-200/80'}`}>
        <nav className={`mx-auto flex w-full items-center justify-between ${accessToken ? 'max-w-screen-2xl px-1 py-2' : 'max-w-xl px-4 py-3'}`}>
          <img
            src="/images/logo/logo_main.jpg"
            alt="DrawkcaB logo"
            className={`${accessToken ? 'h-10 w-32' : 'h-12 w-36'} rounded-md border border-rose-300 object-cover`}
          />
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-rose-400 bg-rose-300 px-3 py-1 text-sm font-medium">
              {accessToken ? 'Signed in' : 'Signed out'}
            </span>
            {accessToken && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open menu"
                className="rounded-md border border-rose-400 bg-rose-300 p-2 text-rose-700 hover:bg-rose-400 lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </nav>
      </header>

      <div className={`mx-auto px-4 ${accessToken ? 'flex-1 min-h-0 max-w-screen-2xl w-full overflow-hidden pb-3 pt-2 landscape:max-lg:flex-none landscape:max-lg:overflow-visible' : 'max-w-xl pb-8'}`}>
        <section
          className={
            accessToken
              ? 'w-full h-full min-h-0 landscape:max-lg:h-auto'
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
            <>
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

              <div className="flex flex-col gap-1">
                <label className="flex flex-col gap-1 text-sm">
                  Display name
                  <input
                    type="text"
                    value={registerDisplayName}
                    onChange={(event) => setRegisterDisplayName(normalizeRegisterDisplayNameInput(event.target.value))}
                    placeholder="@alice"
                    required
                    className={`rounded-md border px-3 py-2 outline-none placeholder:text-rose-500 bg-rose-100 ${
                      displayNameAvailability === 'taken' || displayNameAvailability === 'invalid'
                        ? 'border-red-500 focus:border-red-600'
                        : displayNameAvailability === 'available'
                          ? 'border-green-500 focus:border-green-600'
                          : 'border-rose-300 focus:border-rose-600'
                    }`}
                  />
                </label>
                {displayNameAvailability === 'invalid' && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
                    <svg className="h-4 w-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" /></svg>
                    Must start with @ followed by 3–29 letters, numbers or underscores
                  </p>
                )}
                {displayNameAvailability === 'checking' && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-500">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                    Checking availability…
                  </p>
                )}
                {displayNameAvailability === 'available' && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                    <svg className="h-4 w-4 shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.704 5.296a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.086l6.79-6.79a1 1 0 0 1 1.414 0Z" clipRule="evenodd" /></svg>
                    Display name is available
                  </p>
                )}
                {displayNameAvailability === 'taken' && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
                    <svg className="h-4 w-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" /></svg>
                    Display name is already taken
                  </p>
                )}
                {displayNameAvailability === 'idle' && (
                  <p className="text-xs text-rose-600">Must match ^@[a-zA-Z0-9_]{'{'}3,29{'}'}$</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Registering…' : 'Create account'}
              </button>
            </form>

            <div className="mt-6">
              <p className="mb-2 text-sm font-medium text-rose-700">How it works</p>
              <video
                src="/videos/how.mov"
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-md border border-rose-300"
              />
            </div>
            </>
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
            <div className="relative mt-2 grid h-[calc(100%-0.5rem)] w-full gap-4 overflow-hidden lg:grid-cols-[20rem_minmax(0,1fr)] landscape:max-lg:h-auto landscape:max-lg:overflow-visible">
              {isSidebarOpen && (
                <div
                  className="fixed inset-0 z-20 bg-rose-950/30 backdrop-blur-sm lg:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}
              <aside
                className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-rose-300 bg-rose-200 transition-transform duration-300 ease-in-out lg:static lg:inset-auto lg:z-auto lg:h-full lg:min-h-0 lg:w-auto lg:translate-x-0 lg:rounded-md lg:border ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
              >
                <div className="flex items-center justify-between border-b border-rose-300 p-3 lg:hidden">
                  <span className="text-sm font-semibold text-rose-700">Menu</span>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-label="Close menu"
                    className="rounded-md p-1 text-rose-700 hover:bg-rose-300"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
                <div className="border-b border-rose-300 p-3">
                  <p className="text-sm font-semibold text-rose-700">
                    Welcome {profile?.displayName ?? 'there'}
                  </p>
                  <hr className="my-3 border-rose-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search users by display name"
                    className="w-full rounded-md border border-rose-300 bg-rose-100 px-3 py-2 text-sm outline-none placeholder:text-rose-500 focus:border-rose-600"
                  />
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
                  {searchQuery.trim() && (
                    <section>
                      <h2 className="mb-2 text-sm font-semibold text-rose-700">Users</h2>
                      {isSearching && <p className="text-xs text-rose-500">Searching…</p>}
                      {!isSearching && (
                        <ul className="flex flex-col gap-2">
                          {searchResults.map((user) => {
                            const isConnected = connectedUserIds.has(user.id)
                            const isPending = pendingOutgoingUserIds.has(user.id)
                            const actionKey = `request:${user.displayName}`
                            const isSending = activeActionKey === actionKey
                            return (
                              <li
                                key={user.id}
                                className={`flex items-center gap-2 rounded-md border border-rose-300 bg-rose-100 px-2 py-2 ${isConnected ? 'cursor-pointer hover:bg-rose-200' : ''}`}
                                onClick={isConnected ? () => {
                                  const chat = filteredRecentChats.find((c) => getOtherUser(c).id === user.id)
                                  if (chat) handleOpenChat(chat.id)
                                } : undefined}
                              >
                                <span className="min-w-0 flex-1 truncate text-sm text-rose-700">{user.displayName}</span>
                                {isConnected ? (
                                  <span className="shrink-0 rounded-md border border-rose-400 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-500">
                                    Connected
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void sendRequest(user.displayName)}
                                    disabled={isPending || isSending}
                                    title={isPending ? 'Request already sent' : 'Send chat request'}
                                    aria-label={`Send chat request to ${user.displayName}`}
                                    className="shrink-0 rounded-md border border-rose-700 bg-rose-700 px-2 py-1 text-xs font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isSending ? 'Sending…' : isPending ? 'Sent' : 'Request'}
                                  </button>
                                )}
                              </li>
                            )
                          })}
                          {searchResults.length === 0 && <li className="text-xs text-rose-700">No users found.</li>}
                        </ul>
                      )}
                    </section>
                  )}

                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Recent Chats</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredRecentChats.map((chat) => {
                        const other = getOtherUser(chat)
                        const isActive = selectedChatRequestId === chat.id
                        const isPeerWaiting = waitingPeerRequestIds.has(chat.id)
                        return (
                          <li key={chat.id}>
                            <div
                              className={`flex items-center gap-2 rounded-md border px-2 py-2 ${
                                isActive ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleOpenChat(chat.id)}
                                className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left text-sm"
                              >
                                {isPeerWaiting && (
                                  <span
                                    className="inline-block h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400"
                                    aria-label="Peer is waiting"
                                    title={`${other.displayName} is waiting for you`}
                                  />
                                )}
                                <span className="truncate">{other.displayName}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => closeRecentChat(chat.id)}
                                className={`rounded-md p-1 ${isActive ? 'hover:bg-rose-800 active:bg-rose-900' : 'hover:bg-rose-200 active:bg-rose-300'}`}
                                aria-label={`Close chat with ${other.displayName}`}
                                title="Close chat"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmBlockUser({ id: other.id, displayName: other.displayName })}
                                disabled={activeActionKey === `block:${other.id}`}
                                className={`rounded-md p-1 disabled:cursor-not-allowed disabled:opacity-70 ${isActive ? 'hover:bg-rose-800 active:bg-rose-900' : 'hover:bg-rose-200 active:bg-rose-300'}`}
                                aria-label={`Block ${other.displayName}`}
                                title="Block user"
                              >
                                <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </li>
                        )
                      })}

                      {filteredRecentChats.length === 0 && <li className="text-xs text-rose-700">No recent chats.</li>}
                    </ul>
                  </section>

                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-rose-700">Chat Requests</h2>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewRequestForm((prev) => !prev)
                          setNewRequestDisplayName('@')
                        }}
                        aria-label="Send a new chat request"
                        title="Send a new chat request"
                        className="rounded-md border border-rose-400 bg-rose-200 p-0.5 text-rose-700 hover:bg-rose-300 active:bg-rose-400"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {showNewRequestForm && (
                      <>
                      <form
                        className="mb-3 flex gap-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (isSubmittingNewRequest) return
                          setIsSubmittingNewRequest(true)
                          void sendRequest(newRequestDisplayName).finally(() => {
                            setIsSubmittingNewRequest(false)
                            setShowNewRequestForm(false)
                            setNewRequestDisplayName('@')
                          })
                        }}
                      >
                        <input
                          type="text"
                          value={newRequestDisplayName}
                          onChange={(e) => {
                            const raw = e.target.value
                            if (!raw.startsWith('@')) {
                              setNewRequestDisplayName('@' + raw.replace(/^@+/, ''))
                            } else {
                              setNewRequestDisplayName(raw)
                            }
                          }}
                          placeholder="@username"
                          aria-label="Display name to send chat request to"
                          className="min-w-0 flex-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs text-rose-800 placeholder-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                          disabled={isSubmittingNewRequest}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={
                            isSubmittingNewRequest ||
                            newRequestDisplayName.trim() === '@' ||
                            newRequestDisplayName.trim().length < 2 ||
                            newRequestIsSelf ||
                            newRequestIsAlreadyConnected ||
                            newRequestHasPending
                          }
                          aria-label="Send chat request"
                          title={
                            newRequestIsSelf
                              ? 'You cannot send a request to yourself'
                              : newRequestIsAlreadyConnected
                                ? 'Already connected to this user'
                                : newRequestHasPending
                                  ? 'Request already sent to this user'
                                  : 'Send chat request'
                          }
                          className="shrink-0 rounded-md border border-rose-700 bg-rose-700 p-1.5 text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSubmittingNewRequest ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                          ) : (
                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </form>
                      {(newRequestIsSelf || newRequestIsAlreadyConnected || newRequestHasPending) && (
                        <p className="mb-2 text-xs text-rose-600">
                          {newRequestIsSelf
                            ? 'You cannot send a chat request to yourself.'
                            : newRequestIsAlreadyConnected
                              ? 'You are already connected to this user.'
                              : 'You already have a pending request to this user.'}
                        </p>
                      )}
                      </>
                    )}
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
                      {filteredSavedChats.map((savedChat) => {
                        const other = getOtherUser(savedChat.chatRequest)
                        return (
                          <li key={savedChat.id}>
                            <div className="flex items-center gap-2 rounded-md border border-rose-300 bg-rose-100 px-2 py-2 hover:bg-rose-200 active:bg-rose-300 transition-colors">
                              <button
                                type="button"
                                onClick={() => handleOpenChat(savedChat.chatRequestId)}
                                className="min-w-0 flex-1 truncate text-left text-sm text-rose-700"
                              >
                                {other.displayName}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteChat({ id: savedChat.id, displayName: other.displayName })}
                                disabled={activeActionKey === `delete-chat:${savedChat.id}`}
                                className="rounded-md p-1 text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
                                aria-label={`Delete chat with ${other.displayName}`}
                                title="Delete saved chat"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </li>
                        )
                      })}

                      {filteredSavedChats.length === 0 && <li className="text-xs text-rose-700">No saved chats.</li>}
                    </ul>
                  </section>

                  <section>
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">Blocked Users</h2>
                    <ul className="flex flex-col gap-2">
                      {filteredBlockedUsers.map((blockedUser) => (
                        <li key={blockedUser.id}>
                          <div className="flex items-center gap-2 rounded-md border border-rose-300 bg-rose-100 px-2 py-2 transition-colors hover:bg-rose-200 active:bg-rose-300">
                            <span className="min-w-0 flex-1 truncate text-sm text-rose-700">{blockedUser.displayName}</span>
                            <button
                              type="button"
                              onClick={() => setConfirmUnblockUser({ id: blockedUser.id, displayName: blockedUser.displayName })}
                              disabled={activeActionKey === `unblock:${blockedUser.id}`}
                              className="shrink-0 rounded-md p-1 text-rose-700 hover:bg-rose-300 active:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
                              aria-label={`Unblock ${blockedUser.displayName}`}
                              title="Unblock user"
                            >
                              <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
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
                        onClick={() => { setCenterView('profile'); setIsSidebarOpen(false) }}
                        aria-label="Profile"
                        title="Profile"
                        className="rounded-md border border-rose-700 bg-rose-700 p-2 text-rose-100 hover:bg-rose-800"
                      >
                        <User className="h-5 w-5" aria-hidden="true" />
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
                        <LogOut className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-rose-300 bg-rose-100 px-2 py-1 text-xs text-rose-700 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                        Logout
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              <section className="min-w-0 h-full min-h-0 overflow-hidden rounded-md border border-rose-300 bg-rose-200 p-4 landscape:max-lg:h-auto landscape:max-lg:overflow-visible">
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

                    <div className="flex flex-col gap-1 text-sm">
                      Profile visibility
                      <div className="grid grid-cols-2 rounded-md border border-rose-300 bg-rose-100 p-0.5">
                        <button
                          type="button"
                          onClick={() => setProfileMode('PRIVATE')}
                          className={`rounded px-3 py-2 text-sm font-medium transition-colors ${profileMode === 'PRIVATE' ? 'bg-rose-700 text-rose-100' : 'text-rose-700 hover:bg-rose-200'}`}
                        >
                          Private
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileMode('PUBLIC')}
                          className={`rounded px-3 py-2 text-sm font-medium transition-colors ${profileMode === 'PUBLIC' ? 'bg-rose-700 text-rose-100' : 'text-rose-700 hover:bg-rose-200'}`}
                        >
                          Public
                        </button>
                      </div>
                    </div>

                    <label className={`flex flex-row items-center gap-2 text-sm ${profileMode === 'PUBLIC' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={appearInSearches}
                        disabled={profileMode === 'PUBLIC'}
                        onChange={(event) => setAppearInSearches(event.target.checked)}
                        className="h-4 w-4 accent-rose-700 disabled:cursor-not-allowed"
                      />
                      <span>
                        Appear in searches
                        {profileMode === 'PUBLIC' && (
                          <span className="ml-1 text-xs text-rose-500">(A public profile always appears in searches)</span>
                        )}
                      </span>
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
                        onClick={() => void deleteMyAccount()}
                        disabled={isDeletingAccount}
                        className="rounded-md border border-red-700 bg-red-700 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isDeletingAccount ? 'Deleting…' : 'Delete account'}
                      </button>
                    </div>
                  </form>
                )}

                {!isDashboardLoading && profile && centerView === 'chat' && (
                  <div className="mx-auto flex h-full min-h-0 w-full flex-col items-center gap-4 overflow-hidden landscape:max-lg:h-auto landscape:max-lg:overflow-visible">
                    {!selectedChat && (
                      <div className="flex min-h-80 w-full items-center justify-center rounded-md border border-rose-300 bg-rose-100 p-6 text-center">
                        <div>
                          <h2 className="mb-2 text-lg font-semibold">Start a conversation</h2>
                          <p className="text-sm text-rose-700">Select a recent chat from the left to open your chat canvases.</p>
                        </div>
                      </div>
                    )}

                    {selectedChat && (
                      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden landscape:max-lg:h-auto landscape:max-lg:overflow-visible">
                        {joinedChatRequestId === selectedChat.id && !peerPresent && (
                          <div className="mb-3">
                            <span className="rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                              Waiting for {getOtherUser(selectedChat).displayName} to join…
                            </span>
                          </div>
                        )}

                        <div className="relative min-h-0 flex-1 flex flex-col overflow-hidden landscape:max-lg:flex-none landscape:max-lg:overflow-visible">
                          <div className="grid min-h-0 flex-1 gap-3 overflow-hidden grid-rows-2 landscape:max-lg:flex-none landscape:max-lg:overflow-visible landscape:max-lg:grid-rows-none landscape:max-lg:min-h-[500px]">
                            <div className="relative flex min-h-0 flex-col rounded-md border border-rose-300 bg-rose-100 p-3">
                              <canvas ref={remoteCanvasRef} className="h-full min-h-0 w-full rounded-md border border-rose-300 bg-rose-50 cursor-not-allowed landscape:max-lg:min-h-[200px]" />
                              <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                                {activeRemoteEmotes.map((emote) => (
                                  <span
                                    key={emote.id}
                                    className="emote-float absolute text-5xl"
                                    style={{ left: `${emote.x}%`, bottom: '15%' }}
                                  >
                                    {emote.emoji}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex min-h-0 flex-col rounded-md border border-rose-300 bg-rose-100 p-3">
                              <div className="mb-2 flex flex-wrap items-center gap-1">
                                <button
                                  type="button"
                                  onClick={clearLocalCanvasAndNotify}
                                  disabled={joinedChatRequestId !== selectedChat.id || !peerPresent}
                                  className="rounded-md border border-red-700 bg-red-600 p-1 text-white hover:bg-red-700 active:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                                  title="Clear canvas"
                                  aria-label="Clear canvas"
                                >
                                  <Eraser className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {!savedRequestIdSet.has(selectedChat.id) && (
                                  <button
                                    type="button"
                                    onClick={() => void saveAcceptedChat(selectedChat.id)}
                                    disabled={activeActionKey === `save-chat:${selectedChat.id}`}
                                    className="rounded-md border border-rose-700 bg-rose-700 p-1 text-white hover:bg-rose-800 active:bg-rose-900 disabled:cursor-not-allowed disabled:opacity-70"
                                    title="Save chat"
                                    aria-label="Save chat"
                                  >
                                    <Save className="h-5 w-5" aria-hidden="true" />
                                  </button>
                                )}
                                {(showReconnectButton || isReconnecting) && (
                                  <button
                                    type="button"
                                    onClick={reconnectToRoom}
                                    disabled={isReconnecting}
                                    className="rounded-md border border-amber-600 bg-amber-500 p-1 text-white hover:bg-amber-600 active:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    title="Reconnect to room"
                                    aria-label="Reconnect to room"
                                  >
                                    <RefreshCw className={`h-5 w-5 ${isReconnecting ? 'animate-spin' : ''}`} aria-hidden="true" />
                                  </button>
                                )}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setShowEmotePicker((v) => !v)}
                                    disabled={joinedChatRequestId !== selectedChat.id || !peerPresent}
                                    className="rounded-md border border-rose-400 bg-rose-100 p-1 text-xl leading-none hover:bg-rose-200 active:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
                                    title="Send emoticon"
                                    aria-label="Send emoticon"
                                  >
                                    😊
                                  </button>
                                  {showEmotePicker && (
                                    <div className="absolute bottom-full left-0 z-30 mb-1 w-[min(90vw,26rem)] rounded-lg border border-rose-300 bg-white p-3 shadow-xl md:w-[28rem]">
                                      <div className="overflow-x-auto">
                                        <div className="grid auto-cols-max grid-flow-col grid-rows-4 gap-2 pb-1">
                                          {presetEmotes.map((emoji) => (
                                            <button
                                              key={emoji}
                                              type="button"
                                              onClick={() => {
                                                sendEmote(emoji)
                                                setShowEmotePicker(false)
                                              }}
                                              className="cursor-pointer rounded-lg p-2 text-3xl hover:bg-rose-100 active:bg-rose-200 md:text-2xl"
                                              title={emoji}
                                              aria-label={`Send ${emoji}`}
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="ml-auto flex flex-wrap items-center gap-2">
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setShowBrushSettings((v) => !v)
                                      }}
                                      title="Brush settings"
                                      aria-label="Brush settings"
                                      className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-400 bg-rose-100 text-rose-700 hover:bg-rose-200"
                                    >
                                      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                    {showBrushSettings && (
                                      <div
                                        className="absolute right-0 z-30 w-56 rounded-lg border border-rose-300 bg-white p-3 shadow-xl bottom-full mb-1 max-lg:bottom-auto max-lg:top-full max-lg:mb-0 max-lg:mt-1 max-h-[70vh] overflow-y-scroll"
                                        onClick={(event) => event.stopPropagation()}
                                      >
                                        <div className="mb-2 text-xs font-semibold text-rose-700">Brush</div>
                                        <div className="mb-3 flex flex-col gap-1">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setDrawStrokeStyle('normal')
                                              setShowBrushSettings(false)
                                            }}
                                            className={`flex items-center gap-2 rounded px-2 py-1 text-xs font-medium transition-colors ${drawStrokeStyle === 'normal' ? 'bg-rose-700 text-rose-100' : 'text-rose-700 hover:bg-rose-100'}`}
                                          >
                                            <PenLine className="h-4 w-4" aria-hidden="true" />
                                            Pen
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setDrawStrokeStyle('brush')
                                              setShowBrushSettings(false)
                                            }}
                                            className={`flex items-center gap-2 rounded px-2 py-1 text-xs font-medium transition-colors ${drawStrokeStyle === 'brush' ? 'bg-rose-700 text-rose-100' : 'text-rose-700 hover:bg-rose-100'}`}
                                          >
                                            <Brush className="h-4 w-4" aria-hidden="true" />
                                            Brush
                                          </button>
                                        </div>
                                        <hr className="my-2 border-rose-200" />
                                        <div className="mb-1 text-xs font-semibold text-rose-700">Stroke</div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="range"
                                            min={1}
                                            max={10}
                                            step={1}
                                            value={drawWidth}
                                            onChange={(event) => {
                                              const value = Number(event.target.value) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                                              setDrawWidth(value)
                                            }}
                                            className="w-full accent-rose-700"
                                          />
                                          <span className="w-6 text-right text-xs font-semibold text-rose-700">{drawWidth}</span>
                                        </div>
                                        <hr className="my-2 border-rose-200" />
                                        <div className="flex flex-col gap-2">
                                          <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-medium text-rose-700">Eraser</span>
                                            <button
                                              type="button"
                                              onClick={() => setDrawColor('eraser')}
                                              title="Eraser"
                                              aria-label="Eraser tool"
                                              style={{
                                                borderColor: drawColor === 'eraser' ? '#15803d' : '#86efac',
                                                boxShadow: drawColor === 'eraser' ? '0 0 0 2px #22c55e' : undefined,
                                              }}
                                              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-green-100 transition-transform ${drawColor === 'eraser' ? 'scale-110' : 'hover:scale-105'}`}
                                            >
                                              <Eraser className="h-3.5 w-3.5 text-green-700" aria-hidden="true" />
                                            </button>
                                          </div>
                                          <hr className="border-rose-200" />
                                          <div className="text-xs font-semibold text-rose-700">Color</div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            {presetColors.map((color) => (
                                              <button
                                                key={color}
                                                type="button"
                                                onClick={() => setDrawColor(color)}
                                                className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-105"
                                                style={{
                                                  backgroundColor: color,
                                                  borderColor: drawColor === color ? '#be123c' : '#fda4af',
                                                  boxShadow: drawColor === color ? '0 0 0 2px #fb7185' : undefined,
                                                }}
                                                aria-label={`Select color ${color}`}
                                                title="Select color"
                                              />
                                            ))}
                                          </div>
                                          <hr className="border-rose-200" />
                                          <label className="flex items-center justify-between gap-3 text-xs text-rose-700">
                                            <span className="font-semibold">Custom color</span>
                                            <input
                                              type="color"
                                              value={drawColor === 'eraser' ? '#000000' : drawColor}
                                              onChange={(event) => setDrawColor(event.target.value)}
                                              className="h-6 w-8 cursor-pointer rounded border border-rose-300 p-0"
                                            />
                                          </label>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                            </div>
                              <canvas
                              ref={localCanvasRef}
                              onPointerDown={handleLocalCanvasPointerDown}
                              onPointerMove={handleLocalCanvasPointerMove}
                              onPointerUp={stopLocalDrawing}
                              onPointerLeave={stopLocalDrawing}
                              onPointerCancel={stopLocalDrawing}
                              className={`h-full min-h-0 w-full touch-none rounded-md border border-rose-300 bg-rose-50 landscape:max-lg:min-h-[200px] ${
                                !peerPresent ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                            />
                            </div>
                          </div>
                          <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                            {activeEmotes.map((emote) => (
                              <span
                                key={emote.id}
                                className="emote-float absolute text-5xl"
                                style={{ left: `${emote.x}%`, bottom: '15%' }}
                              >
                                {emote.emoji}
                              </span>
                            ))}
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

        <NoticeBanner notice={notice} onDismiss={onDismissNotice} />
      </div>

      {confirmUnblockUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-unblock-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-rose-300 bg-white p-6 shadow-xl">
            <h2 id="confirm-unblock-title" className="mb-3 text-base font-semibold text-rose-800">
              Unblock User
            </h2>
            <p className="mb-6 text-sm text-rose-700">
              Are you sure you want to unblock{' '}
              <span className="font-semibold">{confirmUnblockUser.displayName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmUnblockUser(null)}
                className="rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 active:bg-rose-200"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  void unblockUser(confirmUnblockUser.id)
                  setConfirmUnblockUser(null)
                }}
                disabled={activeActionKey === `unblock:${confirmUnblockUser.id}`}
                className="rounded-md border border-green-700 bg-green-700 px-4 py-2 text-sm font-medium text-green-100 hover:bg-green-800 active:bg-green-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Yes, unblock
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmBlockUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-block-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-rose-300 bg-white p-6 shadow-xl">
            <h2 id="confirm-block-title" className="mb-3 text-base font-semibold text-rose-800">
              Block User
            </h2>
            <p className="mb-6 text-sm text-rose-700">
              Are you sure you want to block{' '}
              <span className="font-semibold">{confirmBlockUser.displayName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmBlockUser(null)}
                className="rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 active:bg-rose-200"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  void blockUser(confirmBlockUser.id)
                  setConfirmBlockUser(null)
                }}
                disabled={activeActionKey === `block:${confirmBlockUser.id}`}
                className="rounded-md border border-red-700 bg-red-700 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-800 active:bg-red-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Yes, block
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteChat && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
        >
          <div className="w-full max-w-sm rounded-xl border border-rose-300 bg-white p-6 shadow-xl">
            <h2 id="confirm-delete-title" className="mb-3 text-base font-semibold text-rose-800">
              Delete Saved Chat
            </h2>
            <p className="mb-6 text-sm text-rose-700">
              Are you sure you want to delete your chat with{' '}
              <span className="font-semibold">{confirmDeleteChat.displayName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteChat(null)}
                className="rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  void removeSavedChat(confirmDeleteChat.id)
                  setConfirmDeleteChat(null)
                }}
                disabled={activeActionKey === `delete-chat:${confirmDeleteChat.id}`}
                className="rounded-md border border-red-700 bg-red-700 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
