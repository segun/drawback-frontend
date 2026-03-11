import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
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
import { AdminReportsTable } from '../modules/admin/components/AdminReportsTable'
import { AdminSessionEventsTable } from '../modules/admin/components/AdminSessionEventsTable'
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
  AdminReport,
  AdminReportStats,
  AdminReportStatus,
  AdminReportType,
  AdminSearchField,
  AdminSessionEvent,
  AdminSessionEventStats,
  AdminSessionEventType,
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

type ReportFilterState = {
  status: AdminReportStatus | 'ALL'
  reportType: AdminReportType | 'ALL'
  reportedUser: string
  reporter: string
}

type SessionEventFilterState = {
  user: string
  socketId: string
  roomId: string
  requestId: string
  eventType: AdminSessionEventType | 'ALL'
  startDate: string
  endDate: string
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

const DEFAULT_REPORT_FILTER_STATE: ReportFilterState = {
  status: 'ALL',
  reportType: 'ALL',
  reportedUser: '',
  reporter: '',
}

const DEFAULT_SESSION_EVENT_FILTER_STATE: SessionEventFilterState = {
  user: '',
  socketId: '',
  roomId: '',
  requestId: '',
  eventType: 'ALL',
  startDate: '',
  endDate: '',
}

const ADMIN_REPORT_NOTES_MAX = 2000

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

const normalizeOptionalInput = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const sortByDateDesc = <T extends { createdAt: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

const paginateData = <T,>(data: T[], page: number, limit: number): T[] => {
  const start = (page - 1) * limit
  return data.slice(start, start + limit)
}

const toApiReportQuery = (filter: ReportFilterState) => {
  return {
    status: filter.status === 'ALL' ? undefined : filter.status,
    reportType: filter.reportType === 'ALL' ? undefined : filter.reportType,
    reportedUser: normalizeOptionalInput(filter.reportedUser),
    reporter: normalizeOptionalInput(filter.reporter),
  }
}

const toApiSessionEventQuery = (filter: SessionEventFilterState) => {
  return {
    user: normalizeOptionalInput(filter.user),
    socketId: normalizeOptionalInput(filter.socketId),
    roomId: normalizeOptionalInput(filter.roomId),
    requestId: normalizeOptionalInput(filter.requestId),
    eventType: filter.eventType === 'ALL' ? undefined : filter.eventType,
    startDate: normalizeOptionalInput(filter.startDate),
    endDate: normalizeOptionalInput(filter.endDate),
  }
}

const isUserTableView = (viewMode: AdminViewMode): boolean => {
  return viewMode === 'list' || viewMode === 'filter' || viewMode === 'search'
}

const isPaginatedServerView = (viewMode: AdminViewMode): boolean => {
  return isUserTableView(viewMode) || viewMode === 'sockets'
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
  const [reports, setReports] = useState<AdminReport[]>([])
  const [reportStats, setReportStats] = useState<AdminReportStats | null>(null)
  const [sessionEvents, setSessionEvents] = useState<AdminSessionEvent[]>([])
  const [sessionEventStats, setSessionEventStats] = useState<AdminSessionEventStats | null>(null)

  const [isLoadingData, setIsLoadingData] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const [isExportingUsersCsv, setIsExportingUsersCsv] = useState(false)
  const [isMutatingReport, setIsMutatingReport] = useState(false)

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [banReason, setBanReason] = useState('')

  const [searchQueryInput, setSearchQueryInput] = useState('')
  const [searchFieldInput, setSearchFieldInput] = useState<AdminSearchField>('displayName')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [activeSearchField, setActiveSearchField] = useState<AdminSearchField>('displayName')

  const [filterDraft, setFilterDraft] = useState<FilterState>(DEFAULT_FILTER_STATE)
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER_STATE)

  const [reportFilterDraft, setReportFilterDraft] = useState<ReportFilterState>(DEFAULT_REPORT_FILTER_STATE)
  const [activeReportFilter, setActiveReportFilter] = useState<ReportFilterState>(DEFAULT_REPORT_FILTER_STATE)

  const [sessionEventFilterDraft, setSessionEventFilterDraft] = useState<SessionEventFilterState>(
    DEFAULT_SESSION_EVENT_FILTER_STATE,
  )
  const [activeSessionEventFilter, setActiveSessionEventFilter] = useState<SessionEventFilterState>(
    DEFAULT_SESSION_EVENT_FILTER_STATE,
  )

  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null)
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false)
  const [userDetailError, setUserDetailError] = useState<string | null>(null)

  const visibleReports = useMemo(() => paginateData(reports, page, limit), [limit, page, reports])
  const visibleSessionEvents = useMemo(
    () => paginateData(sessionEvents, page, limit),
    [limit, page, sessionEvents],
  )

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

  const loadUserAndSocketData = useCallback(async () => {
    setIsLoadingData(true)
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
      setIsLoadingData(false)
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

  const loadReportsData = useCallback(async () => {
    setIsLoadingData(true)
    setLoadError(null)

    try {
      const [reportsResponse, statsResponse] = await Promise.all([
        adminApi.listReports(toApiReportQuery(activeReportFilter)),
        adminApi.getReportStats(),
      ])

      const sortedReports = sortByDateDesc(reportsResponse)
      setReports(sortedReports)
      setReportStats(statsResponse)
      setTotal(sortedReports.length)
      setUsers([])
      setSockets([])
      setSelectedUserIds(new Set())
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setLoadError(message)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoadingData(false)
    }
  }, [activeReportFilter, adminApi, handleUnauthorizedError])

  const loadSessionEventsData = useCallback(async () => {
    setIsLoadingData(true)
    setLoadError(null)

    try {
      const [eventsResponse, statsResponse] = await Promise.all([
        adminApi.listSessionEvents(toApiSessionEventQuery(activeSessionEventFilter)),
        adminApi.getSessionEventStats(),
      ])

      const sortedEvents = sortByDateDesc(eventsResponse.events)
      setSessionEvents(sortedEvents)
      setSessionEventStats(statsResponse)
      setTotal(eventsResponse.total)
      setUsers([])
      setSockets([])
      setSelectedUserIds(new Set())
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setLoadError(message)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoadingData(false)
    }
  }, [activeSessionEventFilter, adminApi, handleUnauthorizedError])

  useEffect(() => {
    if (!isAuthorized || !isPaginatedServerView(viewMode)) {
      return
    }

    void loadUserAndSocketData()
  }, [isAuthorized, viewMode, page, limit, refreshToken, loadUserAndSocketData])

  useEffect(() => {
    if (!isAuthorized || viewMode !== 'reports') {
      return
    }

    void loadReportsData()
  }, [isAuthorized, viewMode, refreshToken, loadReportsData])

  useEffect(() => {
    if (!isAuthorized || viewMode !== 'sessionEvents') {
      return
    }

    void loadSessionEventsData()
  }, [isAuthorized, viewMode, refreshToken, loadSessionEventsData])

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

  const handleApplyReportsFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setViewMode('reports')
    setActiveReportFilter(reportFilterDraft)
    setPage(ADMIN_DEFAULT_PAGE)
  }

  const handleResetReportsFilter = () => {
    setReportFilterDraft(DEFAULT_REPORT_FILTER_STATE)
    setActiveReportFilter(DEFAULT_REPORT_FILTER_STATE)
    setPage(ADMIN_DEFAULT_PAGE)
  }

  const handleApplySessionEventsFilter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setViewMode('sessionEvents')
    setActiveSessionEventFilter(sessionEventFilterDraft)
    setPage(ADMIN_DEFAULT_PAGE)
  }

  const handleResetSessionEventsFilter = () => {
    setSessionEventFilterDraft(DEFAULT_SESSION_EVENT_FILTER_STATE)
    setActiveSessionEventFilter(DEFAULT_SESSION_EVENT_FILTER_STATE)
    setPage(ADMIN_DEFAULT_PAGE)
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
      await loadUserAndSocketData()
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

  const handleReportStatusChange = async (report: AdminReport, status: AdminReportStatus) => {
    const notes = window.prompt('Optional admin notes:', report.adminNotes ?? '')

    if (notes === null) {
      return
    }

    const normalizedNotes = normalizeOptionalInput(notes)
    if (normalizedNotes && normalizedNotes.length > ADMIN_REPORT_NOTES_MAX) {
      setNotice({
        text: `Admin notes must be ${ADMIN_REPORT_NOTES_MAX} characters or fewer.`,
        type: 'error',
      })
      return
    }

    setIsMutatingReport(true)
    try {
      const updatedReport = await adminApi.updateReport(report.id, {
        status,
        adminNotes: normalizedNotes,
      })

      setReports((previous) => previous.map((item) => (item.id === updatedReport.id ? updatedReport : item)))
      const nextStats = await adminApi.getReportStats()
      setReportStats(nextStats)
      setNotice({ text: `Updated report ${report.id} to ${status}.`, type: 'success' })
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsMutatingReport(false)
    }
  }

  const handleDeleteReport = async (report: AdminReport) => {
    const confirmed = window.confirm(`Delete report ${report.id}? This action cannot be undone.`)
    if (!confirmed) {
      return
    }

    setIsMutatingReport(true)
    try {
      await adminApi.deleteReport(report.id)
      setReports((previous) => {
        const next = previous.filter((item) => item.id !== report.id)
        setTotal(next.length)
        return next
      })
      const nextStats = await adminApi.getReportStats()
      setReportStats(nextStats)
      setNotice({ text: `Deleted report ${report.id}.`, type: 'success' })
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsMutatingReport(false)
    }
  }

  const handleLogout = () => {
    redirectToLogin({
      noticeText: 'Signed out from the admin dashboard.',
      noticeType: 'info',
    })
  }

  const canExportUsersCsv = viewMode === 'list' || viewMode === 'filter'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-12 pt-24">
        <div className="container mx-auto max-w-7xl px-6">
          {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}

          <section className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-rose-900">Admin Dashboard</h1>
              <p className="text-sm text-rose-700">Manage users, safety reports, socket activity, and moderation workflows.</p>
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
              canExportUsersCsv={canExportUsersCsv}
              isLoading={isLoadingData}
              isExporting={isExportingUsersCsv}
            />

            {viewMode === 'reports' && (
              <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
                <h2 className="text-base font-semibold text-rose-900">Safety Reports</h2>
                <p className="mt-1 text-sm text-rose-700">Review abuse reports, update status, and remove invalid reports.</p>

                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Total: {reportStats?.total ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Pending: {reportStats?.pending ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Under Review: {reportStats?.underReview ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Resolved: {reportStats?.resolved ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Dismissed: {reportStats?.dismissed ?? 0}</div>
                </div>

                <form className="mt-3 grid gap-3 md:grid-cols-3 lg:grid-cols-5" onSubmit={handleApplyReportsFilter}>
                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Status
                    <select
                      value={reportFilterDraft.status}
                      onChange={(event) => setReportFilterDraft((previous) => ({
                        ...previous,
                        status: event.target.value as ReportFilterState['status'],
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                    >
                      <option value="ALL">Any</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="DISMISSED">DISMISSED</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Report Type
                    <select
                      value={reportFilterDraft.reportType}
                      onChange={(event) => setReportFilterDraft((previous) => ({
                        ...previous,
                        reportType: event.target.value as ReportFilterState['reportType'],
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                    >
                      <option value="ALL">Any</option>
                      <option value="CSAE">CSAE</option>
                      <option value="HARASSMENT">HARASSMENT</option>
                      <option value="INAPPROPRIATE_CONTENT">INAPPROPRIATE_CONTENT</option>
                      <option value="SPAM">SPAM</option>
                      <option value="IMPERSONATION">IMPERSONATION</option>
                      <option value="OTHER">OTHER</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Reported User
                    <input
                      type="text"
                      value={reportFilterDraft.reportedUser}
                      onChange={(event) => setReportFilterDraft((previous) => ({
                        ...previous,
                        reportedUser: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      placeholder="@badactor"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Reporter
                    <input
                      type="text"
                      value={reportFilterDraft.reporter}
                      onChange={(event) => setReportFilterDraft((previous) => ({
                        ...previous,
                        reporter: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      placeholder="victim@example.com"
                    />
                  </label>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="w-full rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={handleResetReportsFilter}
                      className="w-full rounded-md border border-rose-600 bg-transparent px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </section>
            )}

            {viewMode === 'sessionEvents' && (
              <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
                <h2 className="text-base font-semibold text-rose-900">Session Events</h2>
                <p className="mt-1 text-sm text-rose-700">Inspect connection and room history for abuse investigations.</p>

                <div className="mt-3 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Total: {sessionEventStats?.total ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Last 24h: {sessionEventStats?.last24Hours ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">Last 7d: {sessionEventStats?.last7Days ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">CONNECT: {sessionEventStats?.byType.CONNECT ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">DISCONNECT: {sessionEventStats?.byType.DISCONNECT ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">CHAT_JOINED: {sessionEventStats?.byType.CHAT_JOINED ?? 0}</div>
                  <div className="rounded-md border border-rose-300 bg-rose-50 p-2 text-sm text-rose-900">CHAT_LEFT: {sessionEventStats?.byType.CHAT_LEFT ?? 0}</div>
                </div>

                <form className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-8" onSubmit={handleApplySessionEventsFilter}>
                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    User
                    <input
                      type="text"
                      value={sessionEventFilterDraft.user}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        user: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      placeholder="@badactor or user@example.com"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Socket ID
                    <input
                      type="text"
                      value={sessionEventFilterDraft.socketId}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        socketId: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      placeholder="xyz123"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Room ID
                    <input
                      type="text"
                      value={sessionEventFilterDraft.roomId}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        roomId: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      placeholder="chat:room-id"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Request ID
                    <input
                      type="text"
                      value={sessionEventFilterDraft.requestId}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        requestId: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                      placeholder="a0af8f6d-..."
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Event Type
                    <select
                      value={sessionEventFilterDraft.eventType}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        eventType: event.target.value as SessionEventFilterState['eventType'],
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                    >
                      <option value="ALL">Any</option>
                      <option value="CONNECT">CONNECT</option>
                      <option value="DISCONNECT">DISCONNECT</option>
                      <option value="CHAT_JOINED">CHAT_JOINED</option>
                      <option value="CHAT_LEFT">CHAT_LEFT</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Start Date
                    <input
                      type="date"
                      value={sessionEventFilterDraft.startDate}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        startDate: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    End Date
                    <input
                      type="date"
                      value={sessionEventFilterDraft.endDate}
                      onChange={(event) => setSessionEventFilterDraft((previous) => ({
                        ...previous,
                        endDate: event.target.value,
                      }))}
                      className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="w-full rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      onClick={handleResetSessionEventsFilter}
                      className="w-full rounded-md border border-rose-600 bg-transparent px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </section>
            )}

            {isUserTableView(viewMode) && (
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

            {viewMode === 'sockets' && (
              <AdminSocketsTable
                sockets={sockets}
                isLoading={isLoadingData}
                loadError={loadError}
              />
            )}

            {viewMode === 'reports' && (
              <AdminReportsTable
                reports={visibleReports}
                isLoading={isLoadingData || isMutatingReport}
                loadError={loadError}
                onChangeStatus={(report, status) => void handleReportStatusChange(report, status)}
                onDeleteReport={(report) => void handleDeleteReport(report)}
              />
            )}

            {viewMode === 'sessionEvents' && (
              <AdminSessionEventsTable
                events={visibleSessionEvents}
                isLoading={isLoadingData}
                loadError={loadError}
              />
            )}

            {isUserTableView(viewMode) && (
              <AdminUsersTable
                users={users}
                isLoading={isLoadingData}
                loadError={loadError}
                selectedUserIds={selectedUserIds}
                onToggleUser={handleToggleUser}
                onToggleAllVisible={handleToggleAllVisible}
                onViewDetails={(userId) => void handleViewDetails(userId)}
              />
            )}

            {isUserTableView(viewMode) && (
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
