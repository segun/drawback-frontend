export type AdminUserMode = 'PUBLIC' | 'PRIVATE'
export type AdminSearchField = 'email' | 'displayName'
export type AdminViewMode = 'list' | 'filter' | 'search' | 'sockets' | 'reports' | 'sessionEvents'

export type AdminAppConfigProvider = string

export type AdminAppConfig = {
  ads: {
    provider: AdminAppConfigProvider
  }
  temporaryDiscoveryAccessDurationMinutes: number
}

export type UpdateAdminAppConfigPayload = {
  ads?: {
    provider?: AdminAppConfigProvider
  }
  temporaryDiscoveryAccessDurationMinutes?: number
}

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

export type AdminReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED'

export type AdminReportType =
  | 'CSAE'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'SPAM'
  | 'IMPERSONATION'
  | 'OTHER'

export type AdminReportUser = {
  id: string
  displayName: string
  email: string
}

export type AdminReport = {
  id: string
  reporter: AdminReportUser
  reportedUser: AdminReportUser
  reporterId?: string
  reportedUserId?: string
  reportType: AdminReportType
  description: string
  chatRequestId: string | null
  sessionContext: string | null
  status: AdminReportStatus
  adminNotes: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export type AdminReportsQuery = {
  status?: AdminReportStatus
  reportType?: AdminReportType
  reportedUser?: string
  reporter?: string
}

export type AdminReportStats = {
  total: number
  pending: number
  underReview: number
  resolved: number
  dismissed: number
}

export type UpdateAdminReportPayload = {
  status: AdminReportStatus
  adminNotes?: string
}

export type AdminSessionEventType = 'CONNECT' | 'DISCONNECT' | 'CHAT_JOINED' | 'CHAT_LEFT'

export type AdminSessionEventMetadata = {
  socketId?: string
  userAgent?: string
  roomId?: string
  requestId?: string
  [key: string]: unknown
}

export type AdminSessionEvent = {
  id: string
  userId: string
  user?: {
    id: string
    displayName: string
    email: string
  } | null
  eventType: AdminSessionEventType
  ipAddress: string | null
  metadata: AdminSessionEventMetadata | null
  createdAt: string
}

export type AdminSessionEventsQuery = {
  user?: string
  socketId?: string
  roomId?: string
  requestId?: string
  eventType?: AdminSessionEventType
  startDate?: string
  endDate?: string
}

export type AdminSessionEventsResponse = {
  events: AdminSessionEvent[]
  total: number
}

export type AdminSessionEventStats = {
  total: number
  last24Hours: number
  last7Days: number
  byType: Record<AdminSessionEventType, number>
}

// Geo Providers

export type GeoProviderStatus = 'unknown' | 'healthy' | 'degraded' | 'down' | 'active'

export type GeoProvider = {
  id: string
  name: string
  urlTemplate: string
  responseMapping: Record<string, string>
  attributionText: string | null
  status: GeoProviderStatus
  lastCheckedAt: string | null
  sortOrder: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type CreateGeoProviderPayload = {
  name: string
  urlTemplate: string
  apiKey?: string | null
  responseMapping: Record<string, string>
  attributionText?: string | null
  sortOrder?: number
  isEnabled?: boolean
}

export type UpdateGeoProviderPayload = {
  name?: string
  urlTemplate?: string
  apiKey?: string | null
  responseMapping?: Record<string, string>
  attributionText?: string | null
  sortOrder?: number
  isEnabled?: boolean
}

export type PaginatedGeoProvidersResponse = {
  data: GeoProvider[]
  total: number
  page: number
  limit: number
}

// Campaigns

export type CampaignDisplayType = 'closeable' | 'timed'

export type Campaign = {
  id: string
  header: string | null
  footer: string | null
  link: string
  displayType: CampaignDisplayType
  countdown: number | null
  country: string | null
  region: string | null
  startAt: string
  endAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateCampaignPayload = {
  link: string
  header?: string | null
  footer?: string | null
  displayType?: CampaignDisplayType
  countdown?: number | null
  country?: string | null
  region?: string | null
  startAt: string
  endAt: string
  isActive?: boolean
}

export type UpdateCampaignPayload = {
  link?: string
  header?: string | null
  footer?: string | null
  displayType?: CampaignDisplayType
  countdown?: number | null
  country?: string | null
  region?: string | null
  startAt?: string
  endAt?: string
  isActive?: boolean
}

export type PaginatedCampaignsResponse = {
  data: Campaign[]
  total: number
  page: number
  limit: number
}

export type AdminCampaignsQuery = {
  page?: number
  limit?: number
}

export type CampaignDeliveryStatus = 'sent' | 'skipped' | 'acknowledged'

export type CampaignDeliveryUser = {
  id: string
  displayName: string
}

export type CampaignDeliveryCampaign = {
  id: string
  header: string | null
  link: string
}

export type CampaignDelivery = {
  id: string
  campaignId: string
  userId: string
  status: CampaignDeliveryStatus
  skipReason: string | null
  sentAt: string | null
  acknowledgedAt: string | null
  createdAt: string
  updatedAt: string
  user: CampaignDeliveryUser
  campaign: CampaignDeliveryCampaign
}

export type PaginatedCampaignDeliveriesResponse = {
  data: CampaignDelivery[]
  total: number
  page: number
  limit: number
}

export type AdminCampaignDeliveriesQuery = {
  campaignId?: string
  status?: CampaignDeliveryStatus
  page?: number
  limit?: number
}
