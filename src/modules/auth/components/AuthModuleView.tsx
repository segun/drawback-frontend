import type { PointerEvent as ReactPointerEvent } from 'react'
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
  loginEmail: string
  setLoginEmail: (value: string) => void
  loginPassword: string
  setLoginPassword: (value: string) => void
  isSubmitting: boolean

  searchQuery: string
  setSearchQuery: (value: string) => void
  filteredPublicUsers: UserProfile[]
  profile: UserProfile | null
  blockedUserIdSet: Set<string>
  pendingOutgoingByUserId: Map<string, ChatRequest>
  acceptedChatByUserId: Set<string>
  activeActionKey: string | null
  sendRequest: (toDisplayName: string) => Promise<void>
  cancelRequest: (chatRequestId: string) => Promise<void>
  blockUser: (blockedUserId: string) => Promise<void>
  unblockUser: (blockedUserId: string) => Promise<void>

  filteredRecentChats: ChatRequest[]
  getOtherUser: (request: ChatRequest) => { id: string; displayName: string }
  selectedChatRequestId: string | null
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
  isUpdatingProfile: boolean
  deleteMyAccount: () => Promise<void>
  isDeletingAccount: boolean

  selectedChat: ChatRequest | null
  joinedChatRequestId: string | null
  peerPresent: boolean
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
  presetColors: string[]

  notice: Notice | null
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
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  isSubmitting,
  searchQuery,
  setSearchQuery,
  filteredPublicUsers,
  profile,
  blockedUserIdSet,
  pendingOutgoingByUserId,
  acceptedChatByUserId,
  activeActionKey,
  sendRequest,
  cancelRequest,
  blockUser,
  unblockUser,
  filteredRecentChats,
  getOtherUser,
  selectedChatRequestId,
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
  isUpdatingProfile,
  deleteMyAccount,
  isDeletingAccount,
  selectedChat,
  joinedChatRequestId,
  peerPresent,
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
  presetColors,
  notice,
}: AuthModuleViewProps) {
  return (
    <main className={`bg-rose-0 text-rose-800 ${accessToken ? 'flex h-screen flex-col overflow-hidden' : 'min-h-screen'}`}>
      <header className={`${accessToken ? 'border-b border-rose-300 bg-rose-200/80' : 'mb-6 border-b border-rose-300 bg-rose-200/80'}`}>
        <nav className={`mx-auto flex w-full items-center justify-between ${accessToken ? 'max-w-screen-2xl px-1 py-2' : 'max-w-xl px-4 py-3'}`}>
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

      <div className={`mx-auto px-4 ${accessToken ? 'flex-1 min-h-0 max-w-screen-2xl w-full overflow-hidden pb-3 pt-2' : 'max-w-xl pb-8'}`}>
        <section
          className={
            accessToken
              ? 'w-full h-full min-h-0'
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
                  <div className="mx-auto flex h-full min-h-0 w-full flex-col items-center gap-4 overflow-hidden">
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
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold">Chat with {getOtherUser(selectedChat).displayName}</h2>
                            {joinedChatRequestId === selectedChat.id && !peerPresent && (
                              <span className="rounded-full border border-amber-400 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                                Waiting for {getOtherUser(selectedChat).displayName} to join…
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={clearLocalCanvasAndNotify}
                              disabled={joinedChatRequestId !== selectedChat.id || !peerPresent}
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

                        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden grid-rows-2">
                          <div className="flex min-h-0 flex-col rounded-md border border-rose-300 bg-rose-100 p-3">
                            <p className="mb-2 text-xs text-rose-700">{getOtherUser(selectedChat).displayName}'s canvas</p>
                            <canvas ref={remoteCanvasRef} className="h-full min-h-0 w-full rounded-md border border-rose-300 bg-rose-50 cursor-not-allowed" />
                          </div>
                          <div className="flex min-h-0 flex-col rounded-md border border-rose-300 bg-rose-100 p-3">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <p className="text-xs text-rose-700">Your canvas</p>
                              <div className="ml-auto flex flex-wrap items-center gap-1">
                                {presetColors.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setDrawColor(color)}
                                    title={color}
                                    aria-label={`Pick color ${color}`}
                                    style={{
                                      background: color,
                                      borderColor: drawColor === color ? '#9f1239' : color === '#ffffff' ? '#cbd5e1' : color,
                                      boxShadow: drawColor === color ? '0 0 0 2px #f43f5e' : undefined,
                                    }}
                                    className={`h-5 w-5 rounded-full border-2 transition-transform ${drawColor === color ? 'scale-125' : 'hover:scale-110'}`}
                                  />
                                ))}
                                <label className="cursor-pointer" title="Custom color" aria-label="Custom drawing color">
                                  <span className="sr-only">Custom color</span>
                                  <input
                                    type="color"
                                    value={drawColor}
                                    onChange={(event) => setDrawColor(event.target.value)}
                                    className="h-5 w-5 cursor-pointer rounded border border-rose-300 p-0"
                                  />
                                </label>
                              </div>
                            </div>
                            <canvas
                              ref={localCanvasRef}
                              onPointerDown={handleLocalCanvasPointerDown}
                              onPointerMove={handleLocalCanvasPointerMove}
                              onPointerUp={stopLocalDrawing}
                              onPointerLeave={stopLocalDrawing}
                              onPointerCancel={stopLocalDrawing}
                              className={`h-full min-h-0 w-full touch-none rounded-md border border-rose-300 bg-rose-50 ${
                                !peerPresent ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                            />
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
