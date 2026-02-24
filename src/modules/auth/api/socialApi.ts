import type { AuthApi } from './authApi'

export type UserMode = 'PUBLIC' | 'PRIVATE'

export type UserProfile = {
  id: string
  email: string
  displayName: string
  mode: UserMode
  appearInSearches: boolean
  createdAt: string
  updatedAt: string
}

export type PublicUser = UserProfile

export type ChatRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type ChatRequest = {
  id: string
  fromUserId: string
  toUserId: string
  fromUser: UserProfile
  toUser: UserProfile
  status: ChatRequestStatus
  createdAt: string
  updatedAt: string
}

export type SavedChat = {
  id: string
  chatRequestId: string
  savedByUserId: string
  chatRequest: ChatRequest
  savedBy: UserProfile
  savedAt: string
}

export type BlockedUser = UserProfile

export type UpdateProfilePayload = {
  displayName: string
}

export type RespondToChatRequestResponse = {
  request: ChatRequest
  roomId: string | null
}

export const createSocialApi = (authApi: AuthApi) => {
  const getMyProfile = () => authApi.request<UserProfile>('/users/me')

  const updateMyProfile = (payload: UpdateProfilePayload) =>
    authApi.request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ displayName: payload.displayName }),
    })

  const updateMyMode = (mode: UserMode) =>
    authApi.request<UserProfile>('/users/me/mode', {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    })

  const deleteMyAccount = () =>
    authApi.request<void>('/users/me', {
      method: 'DELETE',
    })

  const listPublicUsers = () => authApi.request<PublicUser[]>('/users/public')

  const searchPublicUsers = (query: string) =>
    authApi.request<PublicUser[]>(`/users/search?q=${encodeURIComponent(query.trim())}`)

  const listSentChatRequests = () => authApi.request<ChatRequest[]>('/chat/requests/sent')

  const listReceivedChatRequests = () => authApi.request<ChatRequest[]>('/chat/requests/received')

  const sendChatRequest = (toDisplayName: string) =>
    authApi.request<ChatRequest>('/chat/requests', {
      method: 'POST',
      body: JSON.stringify({ toDisplayName }),
    })

  const respondToChatRequest = (chatRequestId: string, accept: boolean) =>
    authApi.request<RespondToChatRequestResponse>(`/chat/requests/${chatRequestId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    })

  const cancelChatRequest = (chatRequestId: string) =>
    authApi.request<void>(`/chat/requests/${chatRequestId}`, {
      method: 'DELETE',
    })

  const listSavedChats = () => authApi.request<SavedChat[]>('/chat/saved')

  const saveChat = (chatRequestId: string) =>
    authApi.request<SavedChat>(`/chat/requests/${chatRequestId}/save`, {
      method: 'POST',
    })

  const deleteSavedChat = (savedChatId: string) =>
    authApi.request<void>(`/chat/saved/${savedChatId}`, {
      method: 'DELETE',
    })

  const listBlockedUsers = () => authApi.request<BlockedUser[]>('/users/me/blocked')

  const blockUser = (blockedUserId: string) =>
    authApi.request<void>(`/users/${blockedUserId}/block`, {
      method: 'POST',
    })

  const unblockUser = (blockedUserId: string) =>
    authApi.request<void>(`/users/${blockedUserId}/block`, {
      method: 'DELETE',
    })

  const updateAppearInSearches = (appearInSearches: boolean) =>
    authApi.request<UserProfile>('/users/me/appear-in-searches', {
      method: 'PATCH',
      body: JSON.stringify({ appearInSearches }),
    })

  return {
    getMyProfile,
    updateMyProfile,
    updateMyMode,
    deleteMyAccount,
    listPublicUsers,
    searchPublicUsers,
    listSentChatRequests,
    listReceivedChatRequests,
    sendChatRequest,
    respondToChatRequest,
    cancelChatRequest,
    listSavedChats,
    saveChat,
    deleteSavedChat,
    listBlockedUsers,
    blockUser,
    unblockUser,
    updateAppearInSearches,
  }
}

export type SocialApi = ReturnType<typeof createSocialApi>
