import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { ApiError } from '../common/api/apiError'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { isValidAdminToken } from '../common/utils/jwt'
import { clearAccessToken, getAccessToken } from '../common/utils/tokenStorage'
import { createAdminApi } from '../modules/admin/api/adminApi'
import {
  AdminControls,
  type BooleanFilterValue,
  type ModeFilterValue,
} from '../modules/admin/components/AdminControls'
import { AdminBatchActions } from '../modules/admin/components/AdminBatchActions'
import { AdminSocketsTable } from '../modules/admin/components/AdminSocketsTable'
import { AdminUserDetailPanel } from '../modules/admin/components/AdminUserDetailPanel'
import { AdminUsersTable } from '../modules/admin/components/AdminUsersTable'
import {
  ADMIN_DEFAULT_LIMIT,
  ADMIN_DEFAULT_PAGE,
  ADMIN_MAX_LIMIT,
  ADMIN_MIN_LIMIT,
} from '../modules/admin/constants'
import type {
  AdminFilterUsersQuery,
  AdminSearchField,
  AdminSocketConnection,
  AdminUser,
  AdminUserDetail,
  AdminViewMode,
} from '../modules/admin/types'

type FilterState = {
  mode: ModeFilterValue
  appearInSearches: BooleanFilterValue
  appearInDiscoveryGame: BooleanFilterValue
  isBlocked: BooleanFilterValue
  isActivated: BooleanFilterValue
}

type AdminLoginRedirectState = {
  noticeText: string
  noticeType?: Notice['type']
}

const DEFAULT_FILTER_STATE: FilterState = {
  mode: 'ALL',
  appearInSearches: 'ALL',
  appearInDiscoveryGame: 'ALL',
  isBlocked: 'ALL',
  isActivated: 'ALL',
}

const toBooleanFilter = (value: BooleanFilterValue): boolean | undefined => {
  if (value === 'ALL') {
    return undefined
  }

  return value === 'true'
}

const toApiFilterQuery = (filterState: FilterState): AdminFilterUsersQuery => {
  return {
    mode: filterState.mode === 'ALL' ? undefined : filterState.mode,
    appearInSearches: toBooleanFilter(filterState.appearInSearches),
    appearInDiscoveryGame: toBooleanFilter(filterState.appearInDiscoveryGame),
    isBlocked: toBooleanFilter(filterState.isBlocked),
    isActivated: toBooleanFilter(filterState.isActivated),
  }
}

const clampLimit = (value: number): number => {
  if (!Number.isFinite(value)) {
    return ADMIN_DEFAULT_LIMIT
  }

  return Math.max(ADMIN_MIN_LIMIT, Math.min(ADMIN_MAX_LIMIT, Math.floor(value)))
}

export function AdminDashboardPage() {
  const adminApi = useMemo(() => createAdminApi(import.meta.env.VITE_BACKEND_URL), [])
  const navigate = useNavigate()

  const [notice, setNotice] = useState<Notice | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [viewMode, setViewMode] = useState<AdminViewMode>('list')
  const [page, setPage] = useState(ADMIN_DEFAULT_PAGE)
  const [limit, setLimit] = useState(ADMIN_DEFAULT_LIMIT)
  const [total, setTotal] = useState(0)

  const [users, setUsers] = useState<AdminUser[]>([])
  const [sockets, setSockets] = useState<AdminSocketConnection[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [isExportingUsersCsv, setIsExportingUsersCsv] = useState(false)

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [banReason, setBanReason] = useState('')

  const [searchQueryInput, setSearchQueryInput] = useState('')
  const [searchFieldInput, setSearchFieldInput] = useState<AdminSearchField>('displayName')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [activeSearchField, setActiveSearchField] = useState<AdminSearchField>('displayName')

  const [filterDraft, setFilterDraft] = useState<FilterState>(DEFAULT_FILTER_STATE)
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER_STATE)

  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null)
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false)
  const [userDetailError, setUserDetailError] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const redirectToLogin = useCallback((state: AdminLoginRedirectState) => {
    clearAccessToken()
    navigate('/admin', { replace: true, state })
  }, [navigate])

  const handleUnauthorizedError = useCallback((error: unknown): boolean => {
    if (!(error instanceof ApiError)) {
      return false
    }

    if (error.status === 401) {
      redirectToLogin({
        noticeText: 'Your admin session has expired. Please sign in again.',
        noticeType: 'error',
      })
      return true
    }

    if (error.status === 403) {
      redirectToLogin({
        noticeText: 'Admin access required.',
        noticeType: 'error',
      })
      return true
    }

    return false
  }, [redirectToLogin])

  useEffect(() => {
    if (!isValidAdminToken(getAccessToken())) {
      redirectToLogin({
        noticeText: 'Please sign in with an admin account.',
        noticeType: 'error',
      })
      return
    }

    setIsAuthorized(true)
  }, [redirectToLogin])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    const onUnauthorized = () => {
      redirectToLogin({
        noticeText: 'Your admin session has expired. Please sign in again.',
        noticeType: 'error',
      })
    }

    window.addEventListener('drawback:unauthorized', onUnauthorized)
    return () => window.removeEventListener('drawback:unauthorized', onUnauthorized)
  }, [isAuthorized, redirectToLogin])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true)
    setLoadError(null)

    try {
      let response

      if (viewMode === 'search') {
        if (!activeSearchQuery) {
          setUsers([])
          setSockets([])
          setTotal(0)
          return
        }

        response = await adminApi.searchUsers({
          q: activeSearchQuery,
          searchField: activeSearchField,
          page,
          limit,
        })
        setSockets([])
      } else if (viewMode === 'filter') {
        response = await adminApi.filterUsers({
          ...toApiFilterQuery(activeFilter),
          page,
          limit,
        })
        setSockets([])
      } else if (viewMode === 'sockets') {
        const socketResponse = await adminApi.listSockets({ page, limit })
        setSockets(socketResponse.data)
        setUsers([])
        setTotal(socketResponse.total)
        setSelectedUserIds(new Set())
        return
      } else {
        response = await adminApi.listUsers({ page, limit })
        setSockets([])
      }

      setUsers(response.data)
      setTotal(response.total)
      const allowedIds = new Set(response.data.map((user) => user.id))
      setSelectedUserIds((previous) => new Set([...previous].filter((id) => allowedIds.has(id))))
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setLoadError(message)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoadingUsers(false)
    }
  }, [
    activeFilter,
    activeSearchField,
    activeSearchQuery,
    adminApi,
    handleUnauthorizedError,
    limit,
    page,
    viewMode,
  ])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    void loadUsers()
  }, [isAuthorized, loadUsers, refreshToken])

  const handleViewModeChange = (nextMode: AdminViewMode) => {
    setViewMode(nextMode)
    setSelectedUserIds(new Set())
    setSelectedUserDetail(null)
    setUserDetailError(null)
    setPage(ADMIN_DEFAULT_PAGE)
    setLoadError(null)
  }

  const handleApplySearch = () => {
    const trimmed = searchQueryInput.trim()
    if (!trimmed) {
      setNotice({ text: 'Search query is required.', type: 'error' })
      return
    }

    setViewMode('search')
    setActiveSearchQuery(trimmed)
    setActiveSearchField(searchFieldInput)
    setSelectedUserIds(new Set())
    setPage(ADMIN_DEFAULT_PAGE)
  }

  const handleApplyFilter = () => {
    setViewMode('filter')
    setActiveFilter(filterDraft)
    setSelectedUserIds(new Set())
    setPage(ADMIN_DEFAULT_PAGE)
  }

  const handleResetFilter = () => {
    setFilterDraft(DEFAULT_FILTER_STATE)
    setActiveFilter(DEFAULT_FILTER_STATE)
    setSelectedUserIds(new Set())
    setPage(ADMIN_DEFAULT_PAGE)
    setRefreshToken((value) => value + 1)
  }

  const handleRefresh = () => {
    setRefreshToken((value) => value + 1)
  }

  const handleExportUsersCsv = async () => {
    setIsExportingUsersCsv(true)

    try {
      const exportResponse = await adminApi.exportUsersCsv(toApiFilterQuery(filterDraft))
      const objectUrl = URL.createObjectURL(exportResponse.blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = exportResponse.filename
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)

      setNotice({ text: `Downloaded ${exportResponse.filename}.`, type: 'success' })
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsExportingUsersCsv(false)
    }
  }

  const handleToggleUser = (userId: string, checked: boolean) => {
    setSelectedUserIds((previous) => {
      const next = new Set(previous)
      if (checked) {
        next.add(userId)
      } else {
        next.delete(userId)
      }
      return next
    })
  }

  const handleToggleAllVisible = (checked: boolean) => {
    if (!checked) {
      setSelectedUserIds(new Set())
      return
    }

    setSelectedUserIds(new Set(users.map((user) => user.id)))
  }

  const handleViewDetails = async (userId: string) => {
    setSelectedUserDetail(null)
    setUserDetailError(null)
    setIsLoadingUserDetail(true)

    try {
      const detail = await adminApi.getUserById(userId)
      setSelectedUserDetail(detail)
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setUserDetailError(message)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoadingUserDetail(false)
    }
  }

  const runBatchAction = async (action: 'ban' | 'unban' | 'reset') => {
    if (selectedUserIds.size === 0) {
      setNotice({ text: 'Select at least one user first.', type: 'error' })
      return
    }

    const userIds = Array.from(selectedUserIds)
    let confirmationMessage = ''

    if (action === 'ban') {
      confirmationMessage = `Ban ${userIds.length} selected user(s)?`
    } else if (action === 'unban') {
      confirmationMessage = `Unban ${userIds.length} selected user(s)?`
    } else {
      confirmationMessage = `Send password reset emails to ${userIds.length} selected user(s)?`
    }

    if (!window.confirm(confirmationMessage)) {
      return
    }

    setIsSubmittingAction(true)
    try {
      if (action === 'ban') {
        const reason = banReason.trim()
        const result = await adminApi.banUsers({
          userIds,
          reason: reason || undefined,
        })
        setNotice({ text: `Banned ${result.banned} user(s).`, type: 'success' })
      }

      if (action === 'unban') {
        const result = await adminApi.unbanUsers({ userIds })
        setNotice({ text: `Unbanned ${result.unbanned} user(s).`, type: 'success' })
      }

      if (action === 'reset') {
        const result = await adminApi.resetPasswords({ userIds })
        if (result.failed.length > 0) {
          setNotice({
            text: `Sent ${result.emailsSent} reset email(s). Failed for ${result.failed.length} user(s).`,
            type: 'info',
          })
        } else {
          setNotice({ text: `Sent ${result.emailsSent} reset email(s).`, type: 'success' })
        }
      }

      setSelectedUserIds(new Set())
      setBanReason('')
      await loadUsers()
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const handleLogout = () => {
    redirectToLogin({
      noticeText: 'Signed out from the admin dashboard.',
      noticeType: 'info',
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-7xl px-6">
          {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}

          <section className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-rose-900">Admin Dashboard</h1>
              <p className="text-sm text-rose-700">Manage users, moderation, and password reset workflows.</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-auto rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
            >
              Log Out
            </button>
          </section>

          <div className="flex flex-col gap-4">
            <AdminControls
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
              searchQuery={searchQueryInput}
              searchField={searchFieldInput}
              onSearchQueryChange={setSearchQueryInput}
              onSearchFieldChange={setSearchFieldInput}
              onApplySearch={handleApplySearch}
              filterMode={filterDraft.mode}
              filterAppearInSearches={filterDraft.appearInSearches}
              filterAppearInDiscoveryGame={filterDraft.appearInDiscoveryGame}
              filterIsBlocked={filterDraft.isBlocked}
              filterIsActivated={filterDraft.isActivated}
              onFilterModeChange={(value) => setFilterDraft((previous) => ({ ...previous, mode: value }))}
              onFilterAppearInSearchesChange={(value) => setFilterDraft((previous) => ({ ...previous, appearInSearches: value }))}
              onFilterAppearInDiscoveryGameChange={(value) => setFilterDraft((previous) => ({ ...previous, appearInDiscoveryGame: value }))}
              onFilterIsBlockedChange={(value) => setFilterDraft((previous) => ({ ...previous, isBlocked: value }))}
              onFilterIsActivatedChange={(value) => setFilterDraft((previous) => ({ ...previous, isActivated: value }))}
              onApplyFilter={handleApplyFilter}
              onResetFilter={handleResetFilter}
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onLimitChange={(nextLimit) => {
                setLimit(clampLimit(nextLimit))
                setPage(ADMIN_DEFAULT_PAGE)
              }}
              onPrevPage={() => setPage((previous) => Math.max(1, previous - 1))}
              onNextPage={() => setPage((previous) => Math.min(totalPages, previous + 1))}
              onRefresh={handleRefresh}
              onExportUsersCsv={() => void handleExportUsersCsv()}
              isLoading={isLoadingUsers}
              isExporting={isExportingUsersCsv}
            />

            {viewMode !== 'sockets' && (
              <AdminBatchActions
                selectedCount={selectedUserIds.size}
                banReason={banReason}
                isSubmitting={isSubmittingAction}
                onBanReasonChange={setBanReason}
                onBanSelected={() => void runBatchAction('ban')}
                onUnbanSelected={() => void runBatchAction('unban')}
                onResetPasswords={() => void runBatchAction('reset')}
                onClearSelection={() => setSelectedUserIds(new Set())}
              />
            )}

            {viewMode === 'sockets' ? (
              <AdminSocketsTable
                sockets={sockets}
                isLoading={isLoadingUsers}
                loadError={loadError}
              />
            ) : (
              <AdminUsersTable
                users={users}
                isLoading={isLoadingUsers}
                loadError={loadError}
                selectedUserIds={selectedUserIds}
                onToggleUser={handleToggleUser}
                onToggleAllVisible={handleToggleAllVisible}
                onViewDetails={(userId) => void handleViewDetails(userId)}
              />
            )}

            {viewMode !== 'sockets' && (
              <AdminUserDetailPanel
                user={selectedUserDetail}
                isLoading={isLoadingUserDetail}
                error={userDetailError}
                onClose={() => {
                  setSelectedUserDetail(null)
                  setUserDetailError(null)
                  setIsLoadingUserDetail(false)
                }}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
