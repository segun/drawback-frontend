import { createAuthApi } from '../../auth/api/authApi'
import {
  ADMIN_DEFAULT_LIMIT,
  ADMIN_DEFAULT_PAGE,
  ADMIN_MAX_LIMIT,
  ADMIN_MIN_LIMIT,
} from '../constants'
import type {
  AdminFilterUsersQuery,
  AdminListUsersQuery,
  AdminSearchUsersQuery,
  AdminUserDetail,
  BanUsersPayload,
  BanUsersResponse,
  PaginatedAdminUsersResponse,
  ResetPasswordsPayload,
  ResetPasswordsResponse,
  UnbanUsersPayload,
  UnbanUsersResponse,
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

const buildPaginationQuery = (query: { page?: number; limit?: number } = {}): URLSearchParams => {
  const params = new URLSearchParams()
  appendQueryParam(params, 'page', normalizePage(query.page))
  appendQueryParam(params, 'limit', clampLimit(query.limit))
  return params
}

const withQuery = (path: string, params: URLSearchParams): string => {
  const query = params.toString()
  return query ? `${path}?${query}` : path
}

export const createAdminApi = (baseUrl: string) => {
  const authApi = createAuthApi(baseUrl)

  const listUsers = async (query: AdminListUsersQuery = {}): Promise<PaginatedAdminUsersResponse> => {
    const params = buildPaginationQuery(query)
    return authApi.request<PaginatedAdminUsersResponse>(withQuery('/admin/users', params))
  }

  const filterUsers = async (query: AdminFilterUsersQuery = {}): Promise<PaginatedAdminUsersResponse> => {
    const params = buildPaginationQuery(query)
    appendQueryParam(params, 'mode', query.mode)
    appendQueryParam(params, 'appearInSearches', query.appearInSearches)
    appendQueryParam(params, 'appearInDiscoveryGame', query.appearInDiscoveryGame)
    appendQueryParam(params, 'isBlocked', query.isBlocked)
    appendQueryParam(params, 'isActivated', query.isActivated)

    return authApi.request<PaginatedAdminUsersResponse>(withQuery('/admin/users/filter', params))
  }

  const searchUsers = async (query: AdminSearchUsersQuery): Promise<PaginatedAdminUsersResponse> => {
    const params = buildPaginationQuery(query)
    appendQueryParam(params, 'q', query.q.trim())
    appendQueryParam(params, 'searchField', query.searchField)

    return authApi.request<PaginatedAdminUsersResponse>(withQuery('/admin/users/search', params))
  }

  const getUserById = async (userId: string): Promise<AdminUserDetail> => {
    return authApi.request<AdminUserDetail>(`/admin/users/${userId}`)
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

  const checkAdminAccess = async (): Promise<void> => {
    await listUsers({ page: 1, limit: 1 })
  }

  return {
    listUsers,
    filterUsers,
    searchUsers,
    getUserById,
    banUsers,
    unbanUsers,
    resetPasswords,
    checkAdminAccess,
    logout: authApi.logout,
  }
}

export type AdminApi = ReturnType<typeof createAdminApi>
