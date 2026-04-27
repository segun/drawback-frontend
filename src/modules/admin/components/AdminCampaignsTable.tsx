import type { Campaign } from '../types'

type AdminCampaignsTableProps = {
  campaigns: Campaign[]
  onEdit: (campaign: Campaign) => void
  onDelete: (id: string) => void
  onViewDeliveries: (campaign: Campaign) => void
  isLoading: boolean
  page: number
  totalPages: number
  total: number
  onPrevPage: () => void
  onNextPage: () => void
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function AdminCampaignsTable({
  campaigns = [],
  onEdit,
  onDelete,
  onViewDeliveries,
  isLoading,
  page,
  totalPages,
  total,
  onPrevPage,
  onNextPage,
}: AdminCampaignsTableProps) {
  if (isLoading) {
    return <p className="py-6 text-center text-sm text-rose-600">Loading...</p>
  }

  if (campaigns.length === 0) {
    return <p className="py-6 text-center text-sm text-rose-700">No campaigns found.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rose-200 text-left text-xs font-semibold uppercase tracking-wide text-rose-700">
              <th className="py-2 pr-4">Header</th>
              <th className="py-2 pr-4">Link</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Targeting</th>
              <th className="py-2 pr-4">Start</th>
              <th className="py-2 pr-4">End</th>
              <th className="py-2 pr-4">Active</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-rose-100 last:border-0">
                <td className="max-w-[10rem] py-2 pr-4 text-rose-900">
                  <span className="block truncate" title={campaign.header ?? undefined}>
                    {campaign.header ?? <span className="text-rose-400">—</span>}
                  </span>
                </td>
                <td className="max-w-[12rem] py-2 pr-4">
                  <a
                    href={campaign.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-mono text-xs text-rose-700 underline"
                    title={campaign.link}
                  >
                    {campaign.link}
                  </a>
                </td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      campaign.displayType === 'timed'
                        ? 'rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'
                        : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700'
                    }
                  >
                    {campaign.displayType}
                    {campaign.displayType === 'timed' && campaign.countdown != null
                      ? ` (${campaign.countdown}s)`
                      : ''}
                  </span>
                </td>
                <td className="py-2 pr-4 text-xs text-rose-700">
                  {campaign.country ?? campaign.region
                    ? [campaign.country, campaign.region].filter(Boolean).join(', ')
                    : <span className="text-rose-400">All</span>}
                </td>
                <td className="py-2 pr-4 text-xs text-rose-700">{formatDate(campaign.startAt)}</td>
                <td className="py-2 pr-4 text-xs text-rose-700">{formatDate(campaign.endAt)}</td>
                <td className="py-2 pr-4">
                  <span
                    className={
                      campaign.isActive
                        ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
                        : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                    }
                  >
                    {campaign.isActive ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDeliveries(campaign)}
                      className="rounded border border-rose-400 px-2 py-0.5 text-xs font-medium text-rose-600 hover:bg-rose-200/60"
                    >
                      Deliveries
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(campaign)}
                      className="rounded border border-rose-500 px-2 py-0.5 text-xs font-medium text-rose-700 hover:bg-rose-200/60"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(campaign.id)}
                      className="rounded border border-red-500 px-2 py-0.5 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
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
