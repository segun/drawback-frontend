import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { AdminSessionStatsTable } from '../modules/admin/components/AdminSessionStatsTable'
import { useAdminSessionGuard } from '../modules/admin/hooks/useAdminSessionGuard'
import type { AdminSessionStat, AdminSessionStatsPeriod, AdminSessionStatsQuery } from '../modules/admin/types'

type FilterState = {
  userDisplayName: string
  invitedByDisplayName: string
  period: AdminSessionStatsPeriod | 'ALL'
  startDate: string
  endDate: string
}

const DEFAULT_FILTER: FilterState = {
  userDisplayName: '',
  invitedByDisplayName: '',
  period: 'ALL',
  startDate: '',
  endDate: '',
}

export function AdminSessionStatsPage() {
  const navigate = useNavigate()
  const { adminApi, handleUnauthorizedError, isAuthorized, logout } = useAdminSessionGuard()

  const [notice, setNotice] = useState<Notice | null>(null)
  const [stats, setStats] = useState<AdminSessionStat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [filterDraft, setFilterDraft] = useState<FilterState>(DEFAULT_FILTER)
  const [activeFilter, setActiveFilter] = useState<FilterState>(DEFAULT_FILTER)

  const resolveDisplayName = useCallback(async (namePart: string): Promise<string | undefined> => {
    const trimmed = namePart.trim()
    if (!trimmed) return undefined
    const withAt = `@${trimmed}`
    const result = await adminApi.searchUsers({ q: withAt, searchField: 'displayName', limit: 20 })
    const match = result.data.find((u) => u.displayName.toLowerCase() === withAt.toLowerCase())
    if (!match) {
      throw new Error(`No user found with display name "${withAt}"`)
    }
    return match.id
  }, [adminApi])

  const loadStats = useCallback(async (filter: FilterState) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const [userId, invitedBy] = await Promise.all([
        resolveDisplayName(filter.userDisplayName),
        resolveDisplayName(filter.invitedByDisplayName),
      ])
      const query: AdminSessionStatsQuery = {
        userId,
        invitedBy,
        period: filter.period === 'ALL' ? undefined : filter.period,
        startDate: filter.startDate.trim() || undefined,
        endDate: filter.endDate.trim() || undefined,
      }
      const data = await adminApi.listSessionStats(query)
      setStats(data)
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) return
      const message = mapErrorToMessage(error)
      setLoadError(message)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [adminApi, handleUnauthorizedError, resolveDisplayName])

  useEffect(() => {
    if (isAuthorized) {
      loadStats(activeFilter)
    }
  }, [isAuthorized, activeFilter, loadStats])

  const handleApply = (e: FormEvent) => {
    e.preventDefault()
    setActiveFilter(filterDraft)
  }

  const handleReset = () => {
    setFilterDraft(DEFAULT_FILTER)
    setActiveFilter(DEFAULT_FILTER)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-rose-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-6">
        {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}

        <section className="mb-4 flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-rose-900">Session Stats</h1>
            <p className="text-sm text-rose-700">Aggregated drawing session statistics per user per period.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="ml-auto rounded-md border border-rose-600 bg-transparent px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
          >
            Log Out
          </button>
        </section>

        <form onSubmit={handleApply} className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-rose-300 bg-rose-100 px-4 py-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-rose-800" htmlFor="ss-user-name">User</label>
            <div className="flex items-center overflow-hidden rounded border border-rose-300 bg-white focus-within:ring-1 focus-within:ring-rose-500">
              <span className="select-none border-r border-rose-300 bg-rose-100 px-2 py-1 text-sm font-medium text-rose-700">@</span>
              <input
                id="ss-user-name"
                type="text"
                placeholder="display_name"
                value={filterDraft.userDisplayName}
                onChange={(e) => setFilterDraft((prev) => ({ ...prev, userDisplayName: e.target.value }))}
                className="w-32 bg-transparent px-2 py-1 text-sm text-rose-900 placeholder-rose-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-rose-800" htmlFor="ss-invited-by-name">Invited By</label>
            <div className="flex items-center overflow-hidden rounded border border-rose-300 bg-white focus-within:ring-1 focus-within:ring-rose-500">
              <span className="select-none border-r border-rose-300 bg-rose-100 px-2 py-1 text-sm font-medium text-rose-700">@</span>
              <input
                id="ss-invited-by-name"
                type="text"
                placeholder="display_name"
                value={filterDraft.invitedByDisplayName}
                onChange={(e) => setFilterDraft((prev) => ({ ...prev, invitedByDisplayName: e.target.value }))}
                className="w-32 bg-transparent px-2 py-1 text-sm text-rose-900 placeholder-rose-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-rose-800" htmlFor="ss-period">Period</label>
            <select
              id="ss-period"
              value={filterDraft.period}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, period: e.target.value as FilterState['period'] }))}
              className="rounded border border-rose-300 bg-white px-2 py-1 text-sm text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="ALL">All (default: day)</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-rose-800" htmlFor="ss-start-date">Start Date</label>
            <input
              id="ss-start-date"
              type="date"
              value={filterDraft.startDate}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, startDate: e.target.value }))}
              className="rounded border border-rose-300 bg-white px-2 py-1 text-sm text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-rose-800" htmlFor="ss-end-date">End Date</label>
            <input
              id="ss-end-date"
              type="date"
              value={filterDraft.endDate}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, endDate: e.target.value }))}
              className="rounded border border-rose-300 bg-white px-2 py-1 text-sm text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-rose-400 bg-transparent px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
          >
            Reset
          </button>
        </form>

        {!isLoading && !loadError && (
          <p className="mb-2 text-sm text-rose-700">{stats.length} row{stats.length !== 1 ? 's' : ''}</p>
        )}

        <AdminSessionStatsTable stats={stats} isLoading={isLoading} loadError={loadError} />
      </main>
      <Footer />
    </div>
  )
}
