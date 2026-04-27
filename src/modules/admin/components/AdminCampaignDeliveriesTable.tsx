import type { CampaignDelivery, CampaignDeliveryStatus } from '../types'

type AdminCampaignDeliveriesTableProps = {
  deliveries: CampaignDelivery[]
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  onPrevPage: () => void
  onNextPage: () => void
}

const formatDate = (iso: string | null): string => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

const STATUS_CLASSES: Record<CampaignDeliveryStatus, string> = {
  sent: 'rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800',
  acknowledged: 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800',
  skipped: 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600',
}

export function AdminCampaignDeliveriesTable({
  deliveries = [],
  isLoading,
  page,
  totalPages,
  total,
  onPrevPage,
  onNextPage,
}: AdminCampaignDeliveriesTableProps) {
  if (isLoading) {
    return <p className="py-6 text-center text-sm text-rose-600">Loading...</p>
  }

  if (deliveries.length === 0) {
    return <p className="py-6 text-center text-sm text-rose-700">No deliveries found.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rose-200 text-left text-xs font-semibold uppercase tracking-wide text-rose-700">
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Sent At</th>
              <th className="py-2 pr-4">Acknowledged At</th>
              <th className="py-2">Skip Reason</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => (
              <tr key={delivery.id} className="border-b border-rose-100 last:border-0">
                <td className="py-2 pr-4 font-mono text-xs text-rose-900">
                  {delivery.user?.displayName ?? delivery.userId}
                </td>
                <td className="py-2 pr-4">
                  <span className={STATUS_CLASSES[delivery.status] ?? STATUS_CLASSES.sent}>
                    {delivery.status}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-rose-700">
                  {formatDate(delivery.sentAt)}
                </td>
                <td className="py-2 pr-4 text-xs text-rose-700">
                  {formatDate(delivery.acknowledgedAt)}
                </td>
                <td className="py-2 text-xs text-rose-700">
                  {delivery.skipReason ?? <span className="text-rose-400">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-3 text-sm text-rose-700">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={page <= 1}
            className="rounded border border-rose-400 px-3 py-1 text-xs hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-xs">
            Page {page} of {totalPages} ({total} total)
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={page >= totalPages}
            className="rounded border border-rose-400 px-3 py-1 text-xs hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
