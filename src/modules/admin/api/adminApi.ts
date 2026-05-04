import { ApiError } from '../../../common/api/apiError'
import { createAuthApi } from '../../auth/api/authApi'
import {
  ADMIN_DEFAULT_LIMIT,
  ADMIN_DEFAULT_PAGE,
  ADMIN_MAX_LIMIT,
  ADMIN_MIN_LIMIT,
} from '../constants'
import type {
  AdminAppConfig,
  AdminReport,
  AdminReportStats,
  AdminReportsQuery,
  AdminSessionEvent,
  AdminSessionEventsResponse,
  AdminSessionEventStats,
  AdminSessionEventsQuery,
  AdminExportCsvResponse,
  AdminExportUsersQuery,
  AdminFilterUsersQuery,
  AdminListUsersQuery,
  AdminSearchUsersQuery,
  AdminUserDetail,
  PaginatedAdminSocketsResponse,
  BanUsersPayload,
  BanUsersResponse,
  PaginatedAdminUsersResponse,
  ResetPasswordsPayload,
  ResetPasswordsResponse,
  UpdateAdminAppConfigPayload,
  UpdateAdminReportPayload,
  UnbanUsersPayload,
  UnbanUsersResponse,
  GeoProvider,
  CreateGeoProviderPayload,
  UpdateGeoProviderPayload,
  PaginatedGeoProvidersResponse,
  Campaign,
  CreateCampaignPayload,
  UpdateCampaignPayload,
  PaginatedCampaignsResponse,
  AdminCampaignsQuery,
  PaginatedCampaignDeliveriesResponse,
  AdminCampaignDeliveriesQuery,
  AdminSessionStat,
  AdminSessionStatsQuery,
} from '../types'

const clampLimit = (limit?: number): number => {
  if (!limit) {
    return ADMIN_DEFAULT_LIMIT
  }

  return Math.max(ADMIN_MIN_LIMIT, Math.min(ADMIN_MAX_LIMIT, limit))
}

const normalizePage = (page?: number): number => {
  if (!page) {
    return ADMIN_DEFAULT_PAGE
  }

  return Math.max(ADMIN_DEFAULT_PAGE, page)
}

const appendQueryParam = (params: URLSearchParams, key: string, value: string | number | boolean | undefined) => {
  if (value === undefined) {
    return
  }

  params.set(key, String(value))
}

const buildFilterQuery = (query: AdminExportUsersQuery = {}): URLSearchParams => {
  const params = new URLSearchParams()
  appendQueryParam(params, 'mode', query.mode)
  appendQueryParam(params, 'appearInSearches', query.appearInSearches)
  appendQueryParam(params, 'appearInDiscoveryGame', query.appearInDiscoveryGame)
  appendQueryParam(params, 'isBlocked', query.isBlocked)
  appendQueryParam(params, 'isActivated', query.isActivated)
  return params
}

const buildPaginationQuery = (query: { page?: number; limit?: number } = {}): URLSearchParams => {
  const params = new URLSearchParams()
  appendQueryParam(params, 'page', normalizePage(query.page))
  appendQueryParam(params, 'limit', clampLimit(query.limit))
  return params
}

const buildReportsQuery = (query: AdminReportsQuery = {}): URLSearchParams => {
  const params = new URLSearchParams()
  appendQueryParam(params, 'status', query.status)
  appendQueryParam(params, 'reportType', query.reportType)
  appendQueryParam(params, 'reportedUser', query.reportedUser?.trim() || undefined)
  appendQueryParam(params, 'reporter', query.reporter?.trim() || undefined)
  return params
}

const buildSessionEventsQuery = (query: AdminSessionEventsQuery = {}): URLSearchParams => {
  const params = new URLSearchParams()
  appendQueryParam(params, 'user', query.user?.trim() || undefined)
  appendQueryParam(params, 'socketId', query.socketId?.trim() || undefined)
  appendQueryParam(params, 'roomId', query.roomId?.trim() || undefined)
  appendQueryParam(params, 'requestId', query.requestId?.trim() || undefined)
  appendQueryParam(params, 'eventType', query.eventType)
  appendQueryParam(params, 'startDate', query.startDate?.trim() || undefined)
  appendQueryParam(params, 'endDate', query.endDate?.trim() || undefined)
  return params
}

const withQuery = (path: string, params: URLSearchParams): string => {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

const DEFAULT_TEMP_DISCOVERY_ACCESS_DURATION_MINUTES = 1

const hasAppConfigShape = (config: AdminAppConfig | null): boolean => {
  return Boolean(
    config
    && (
      config.ads?.provider !== undefined
      || config.temporaryDiscoveryAccessDurationMinutes !== undefined
    ),
  )
}

const normalizeAppConfig = (config: AdminAppConfig | null): AdminAppConfig => {
  const duration = config?.temporaryDiscoveryAccessDurationMinutes
  const normalizedDuration = Number.isInteger(duration) && duration >= 1
    ? duration
    : DEFAULT_TEMP_DISCOVERY_ACCESS_DURATION_MINUTES

  return {
    ads: {
      provider: config?.ads?.provider ?? '',
    },
    temporaryDiscoveryAccessDurationMinutes: normalizedDuration,
  }
}

export const createAdminApi = (baseUrl: string) => {
  const authApi = createAuthApi(baseUrl)
  const sanitizedBaseUrl = baseUrl.replace(/\/$/, '')

  const requestBlob = async (path: string): Promise<AdminExportCsvResponse> => {
    const token = authApi.getAccessToken()

    if (!token) {
      throw new ApiError(401, 'Missing access token. Please log in.')
    }

    const response = await fetch(`${sanitizedBaseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      let message = `Request failed: ${response.status}`

      try {
        const errorBody = (await response.json()) as { message?: string | string[] }
        if (errorBody?.message) {
          message = Array.isArray(errorBody.message)
            ? errorBody.message.join('. ')
            : errorBody.message
        }
      } catch {
        // no-op
      }

      if (response.status === 401) {
        window.dispatchEvent(new Event('drawback:unauthorized'))
      }

      throw new ApiError(response.status, message)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') ?? ''
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/i)

    return {
      blob,
      filename: filenameMatch?.[1] ?? 'users-export.csv',
    }
  }

  const listUsers = async (query: AdminListUsersQuery = {}): Promise<PaginatedAdminUsersResponse> => {
    const params = buildPaginationQuery(query)
    return authApi.request<PaginatedAdminUsersResponse>(withQuery('/admin/users', params))
  }

  const filterUsers = async (query: AdminFilterUsersQuery = {}): Promise<PaginatedAdminUsersResponse> => {
    const params = buildPaginationQuery(query)
    const filterParams = buildFilterQuery(query)

    filterParams.forEach((value, key) => {
      params.set(key, value)
    })

    return authApi.request<PaginatedAdminUsersResponse>(withQuery('/admin/users/filter', params))
  }

  const listSockets = async (query: AdminListUsersQuery = {}): Promise<PaginatedAdminSocketsResponse> => {
    const params = buildPaginationQuery(query)
    return authApi.request<PaginatedAdminSocketsResponse>(withQuery('/admin/sockets', params))
  }

  const searchUsers = async (query: AdminSearchUsersQuery): Promise<PaginatedAdminUsersResponse> => {
    const params = buildPaginationQuery(query)
    appendQueryParam(params, 'q', query.q.trim())
    appendQueryParam(params, 'searchField', query.searchField)

    return authApi.request<PaginatedAdminUsersResponse>(withQuery('/admin/users/search', params))
  }

  const getGlobalAppConfig = async (): Promise<AdminAppConfig> => {
    const response = await authApi.request<AdminAppConfig | null>('/admin/app-config')
    return normalizeAppConfig(response)
  }

  const updateGlobalAppConfig = async (payload: UpdateAdminAppConfigPayload): Promise<AdminAppConfig> => {
    const response = await authApi.request<AdminAppConfig | null>('/admin/app-config', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })

    return normalizeAppConfig(response)
  }

  const getUserAppConfig = async (userId: string): Promise<AdminAppConfig> => {
    const response = await authApi.request<AdminAppConfig | null>(`/admin/app-config/users/${userId}`)

    if (hasAppConfigShape(response)) {
      return normalizeAppConfig(response)
    }

    return getGlobalAppConfig()
  }

  const updateUserAppConfig = async (
    userId: string,
    payload: UpdateAdminAppConfigPayload,
  ): Promise<AdminAppConfig> => {
    const response = await authApi.request<AdminAppConfig | null>(`/admin/app-config/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })

    if (hasAppConfigShape(response)) {
      return normalizeAppConfig(response)
    }

    return getUserAppConfig(userId)
  }

  const getUserById = async (userId: string): Promise<AdminUserDetail> => {
    return authApi.request<AdminUserDetail>(`/admin/users/details/${userId}`)
  }

  const banUsers = async (payload: BanUsersPayload): Promise<BanUsersResponse> => {
    return authApi.request<BanUsersResponse>('/admin/users/ban', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const unbanUsers = async (payload: UnbanUsersPayload): Promise<UnbanUsersResponse> => {
    return authApi.request<UnbanUsersResponse>('/admin/users/unban', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const resetPasswords = async (payload: ResetPasswordsPayload): Promise<ResetPasswordsResponse> => {
    return authApi.request<ResetPasswordsResponse>('/admin/users/reset-passwords', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const exportUsersCsv = async (query: AdminExportUsersQuery = {}): Promise<AdminExportCsvResponse> => {
    const params = buildFilterQuery(query)
    return requestBlob(withQuery('/admin/users/export', params))
  }

  const listReports = async (query: AdminReportsQuery = {}): Promise<AdminReport[]> => {
    const params = buildReportsQuery(query)
    return authApi.request<AdminReport[]>(withQuery('/reports/admin', params))
  }

  const getReportStats = async (): Promise<AdminReportStats> => {
    return authApi.request<AdminReportStats>('/reports/admin/stats')
  }

  const updateReport = async (reportId: string, payload: UpdateAdminReportPayload): Promise<AdminReport> => {
    return authApi.request<AdminReport>(`/reports/admin/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  const deleteReport = async (reportId: string): Promise<void> => {
    await authApi.request<null>(`/reports/admin/${reportId}`, {
      method: 'DELETE',
    })
  }

  const listSessionEvents = async (query: AdminSessionEventsQuery = {}): Promise<AdminSessionEventsResponse> => {
    const params = buildSessionEventsQuery(query)
    const raw = await authApi.request<
      | AdminSessionEvent[]
      | {
          events?: AdminSessionEvent[]
          total?: number
          data?: AdminSessionEvent[]
        }
    >(withQuery('/admin/session-events', params))

    if (Array.isArray(raw)) {
      return {
        events: raw,
        total: raw.length,
      }
    }

    const events = Array.isArray(raw.events)
      ? raw.events
      : Array.isArray(raw.data)
        ? raw.data
        : []

    return {
      events,
      total: typeof raw.total === 'number' ? raw.total : events.length,
    }
  }

  const getSessionEventStats = async (): Promise<AdminSessionEventStats> => {
    return authApi.request<AdminSessionEventStats>('/admin/session-events/stats')
  }

  const checkAdminAccess = async (): Promise<void> => {
    await listUsers({ page: 1, limit: 1 })
  }

  // Geo Providers

  const listGeoProviders = async (): Promise<PaginatedGeoProvidersResponse> => {
    return authApi.request<PaginatedGeoProvidersResponse>('/admin/geo-providers')
  }

  const getGeoProvider = async (id: string): Promise<GeoProvider> => {
    return authApi.request<GeoProvider>(`/admin/geo-providers/${id}`)
  }

  const createGeoProvider = async (payload: CreateGeoProviderPayload): Promise<GeoProvider> => {
    return authApi.request<GeoProvider>('/admin/geo-providers', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const updateGeoProvider = async (id: string, payload: UpdateGeoProviderPayload): Promise<GeoProvider> => {
    return authApi.request<GeoProvider>(`/admin/geo-providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  const deleteGeoProvider = async (id: string): Promise<void> => {
    await authApi.request<null>(`/admin/geo-providers/${id}`, {
      method: 'DELETE',
    })
  }

  // Campaigns

  const listCampaigns = async (query: AdminCampaignsQuery = {}): Promise<PaginatedCampaignsResponse> => {
    const params = buildPaginationQuery(query)
    return authApi.request<PaginatedCampaignsResponse>(withQuery('/admin/campaigns', params))
  }

  const getCampaign = async (id: string): Promise<Campaign> => {
    return authApi.request<Campaign>(`/admin/campaigns/${id}`)
  }

  const createCampaign = async (payload: CreateCampaignPayload): Promise<Campaign> => {
    return authApi.request<Campaign>('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  const updateCampaign = async (id: string, payload: UpdateCampaignPayload): Promise<Campaign> => {
    return authApi.request<Campaign>(`/admin/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  const deleteCampaign = async (id: string): Promise<void> => {
    await authApi.request<null>(`/admin/campaigns/${id}`, {
      method: 'DELETE',
    })
  }

  // Session Stats

  const listSessionStats = async (query: AdminSessionStatsQuery = {}): Promise<AdminSessionStat[]> => {
    const params = new URLSearchParams()
    appendQueryParam(params, 'userId', query.userId?.trim() || undefined)
    appendQueryParam(params, 'invitedBy', query.invitedBy?.trim() || undefined)
    appendQueryParam(params, 'period', query.period)
    appendQueryParam(params, 'startDate', query.startDate?.trim() || undefined)
    appendQueryParam(params, 'endDate', query.endDate?.trim() || undefined)
    return authApi.request<AdminSessionStat[]>(withQuery('/admin/session-stats', params))
  }

  // Campaign Deliveries

  const listCampaignDeliveries = async (query: AdminCampaignDeliveriesQuery = {}): Promise<PaginatedCampaignDeliveriesResponse> => {
    const params = new URLSearchParams()
    if (query.campaignId) params.set('campaignId', query.campaignId)
    if (query.status) params.set('status', query.status)
    if (query.page != null) params.set('page', String(query.page))
    if (query.limit != null) params.set('limit', String(query.limit))
    const qs = params.toString()
    return authApi.request<PaginatedCampaignDeliveriesResponse>(
      qs ? `/admin/campaign-deliveries?${qs}` : '/admin/campaign-deliveries',
    )
  }

  return {
    listUsers,
    filterUsers,
    searchUsers,
    getGlobalAppConfig,
    updateGlobalAppConfig,
    getUserAppConfig,
    updateUserAppConfig,
    listSockets,
    getUserById,
    banUsers,
    unbanUsers,
    resetPasswords,
    exportUsersCsv,
    listReports,
    getReportStats,
    updateReport,
    deleteReport,
    listSessionEvents,
    getSessionEventStats,
    checkAdminAccess,
    listGeoProviders,
    getGeoProvider,
    createGeoProvider,
    updateGeoProvider,
    deleteGeoProvider,
    listCampaigns,
    getCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    listCampaignDeliveries,
    listSessionStats,
    logout: authApi.logout,
  }
}

export type AdminApi = ReturnType<typeof createAdminApi>
