import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { AdminCampaignDeliveriesTable } from '../modules/admin/components/AdminCampaignDeliveriesTable'
import { useAdminSessionGuard } from '../modules/admin/hooks/useAdminSessionGuard'
import { ADMIN_DEFAULT_PAGE } from '../modules/admin/constants'
import type { CampaignDeliveryStatus } from '../modules/admin/types'

const DELIVERIES_LIMIT = 20

const STATUS_OPTIONS: Array<{ label: string; value: CampaignDeliveryStatus | '' }> = [
  { label: 'All statuses', value: '' },
  { label: 'Sent', value: 'sent' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Skipped', value: 'skipped' },
]

export function AdminCampaignDeliveriesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const campaignId = searchParams.get('campaignId') ?? undefined
  const campaignHeader = searchParams.get('campaignHeader') ?? undefined

  const { adminApi, handleUnauthorizedError, isAuthorized, logout } = useAdminSessionGuard()

  const [notice, setNotice] = useState<Notice | null>(null)
  const [deliveries, setDeliveries] = useState<import('../modules/admin/types').CampaignDelivery[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(ADMIN_DEFAULT_PAGE)
  const [statusFilter, setStatusFilter] = useState<CampaignDeliveryStatus | ''>('')
  const [isLoading, setIsLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / DELIVERIES_LIMIT))

  const loadDeliveries = useCallback(async (targetPage: number, status: CampaignDeliveryStatus | '') => {
    setIsLoading(true)
    try {
      const data = await adminApi.listCampaignDeliveries({
        campaignId,
        status: status || undefined,
        page: targetPage,
        limit: DELIVERIES_LIMIT,
      })
      setDeliveries(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) return
      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [adminApi, handleUnauthorizedError, campaignId])

  useEffect(() => {
    if (!isAuthorized) return
    void loadDeliveries(page, statusFilter)
  }, [isAuthorized, loadDeliveries, page, statusFilter])

  const handleStatusChange = (value: CampaignDeliveryStatus | '') => {
    setStatusFilter(value)
    setPage(ADMIN_DEFAULT_PAGE)
  }

  const pageTitle = campaignHeader ? `Deliveries — ${campaignHeader}` : 'Campaign Deliveries'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-12 pt-24">
        <div className="container mx-auto max-w-5xl px-6">
          {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}

          <section className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-rose-900">{pageTitle}</h1>
              <p className="text-sm text-rose-700">Users who received this campaign.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/campaigns')}
              className="ml-auto rounded-md border border-rose-600 bg-transparent px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
            >
              Back to Campaigns
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
            >
              Log Out
            </button>
          </section>

          <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-rose-900">
                Deliveries
                {total > 0 && (
                  <span className="ml-2 text-sm font-normal text-rose-600">({total} total)</span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value as CampaignDeliveryStatus | '')}
                  className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm text-rose-900 outline-none focus:border-rose-600"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void loadDeliveries(page, statusFilter)}
                  disabled={isLoading}
                  className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
            <AdminCampaignDeliveriesTable
              deliveries={deliveries}
              isLoading={isLoading}
              page={page}
              totalPages={totalPages}
              total={total}
              onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
              onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
