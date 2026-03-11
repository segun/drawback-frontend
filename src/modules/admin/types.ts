export type AdminUserMode = 'PUBLIC' | 'PRIVATE'
export type AdminSearchField = 'email' | 'displayName'
export type AdminViewMode = 'list' | 'filter' | 'search' | 'sockets'

export type AdminUser = {
  id: string
  email: string
  displayName: string
  mode: AdminUserMode
  role?: string
  isBlocked: boolean
  blockedAt?: string | null
  blockedReason?: string | null
  isActivated?: boolean
  appearInSearches?: boolean
  appearInDiscoveryGame?: boolean
  hasDiscoveryAccess?: boolean
  discoveryImageUrl?: string | null
  createdAt: string
  updatedAt: string
}

export type AdminUserDetail = {
  id: string
  email: string
  displayName: string
  mode: AdminUserMode
  role: string
  isBlocked: boolean
  blockedAt: string | null
  blockedReason: string | null
  isActivated: boolean
  activationTokenExpiry: string | null
  resetTokenExpiry: string | null
  deleteTokenExpiry: string | null
  appearInSearches: boolean
  appearInDiscoveryGame: boolean
  hasDiscoveryAccess: boolean
  discoveryImageUrl: string | null
  createdAt: string
  updatedAt: string
}

export type PaginatedAdminUsersResponse = {
  data: AdminUser[]
  total: number
  page: number
  limit: number
}

export type AdminListUsersQuery = {
  page?: number
  limit?: number
}

export type AdminFilterUsersQuery = {
  page?: number
  limit?: number
  mode?: AdminUserMode
  appearInSearches?: boolean
  appearInDiscoveryGame?: boolean
  isBlocked?: boolean
  isActivated?: boolean
}

export type AdminExportUsersQuery = Omit<AdminFilterUsersQuery, 'page' | 'limit'>

export type AdminSearchUsersQuery = {
  q: string
  searchField: AdminSearchField
  page?: number
  limit?: number
}

export type BanUsersPayload = {
  userIds: string[]
  reason?: string
}

export type BanUsersResponse = {
  banned: number
}

export type UnbanUsersPayload = {
  userIds: string[]
}

export type UnbanUsersResponse = {
  unbanned: number
}

export type ResetPasswordsPayload = {
  userIds: string[]
}

export type ResetPasswordsResponse = {
  emailsSent: number
  failed: string[]
}

export type AdminSocketConnection = {
  userId: string
  userEmail: string
  userDisplayName: string
  socketId: string
  connectedAt: string
  currentRoom: string | null
  ipAddress: string
  userAgent: string
}

export type PaginatedAdminSocketsResponse = {
  data: AdminSocketConnection[]
  total: number
  page: number
  limit: number
}

export type AdminExportCsvResponse = {
  blob: Blob
  filename: string
}
