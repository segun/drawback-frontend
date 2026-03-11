import type { AdminSessionEvent } from '../types'

type AdminSessionEventsTableProps = {
  events: AdminSessionEvent[]
  isLoading: boolean
  loadError: string | null
}

const formatDateTime = (value: string): string => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

const truncateText = (value: string | null | undefined, maxLength: number): string => {
  if (!value) {
    return '-'
  }

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3)}...`
}

const metadataValue = (metadata: AdminSessionEvent['metadata'], key: string): string => {
  if (!metadata) {
    return '-'
  }

  const raw = metadata[key]
  if (raw === null || raw === undefined) {
    return '-'
  }

  return String(raw)
}

export function AdminSessionEventsTable({ events, isLoading, loadError }: AdminSessionEventsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-rose-300 bg-rose-100 shadow-sm shadow-rose-300/30">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-rose-300 text-rose-800">
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2">IP Address</th>
            <th className="px-3 py-2">Room ID</th>
            <th className="px-3 py-2">Socket ID</th>
            <th className="px-3 py-2">Request ID</th>
            <th className="px-3 py-2">User Agent</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={8} className="px-3 py-5 text-center text-rose-700">
                Loading session events...
              </td>
            </tr>
          )}

          {!isLoading && loadError && (
            <tr>
              <td colSpan={8} className="px-3 py-5 text-center text-red-700">
                {loadError}
              </td>
            </tr>
          )}

          {!isLoading && !loadError && events.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-5 text-center text-rose-700">
                No session events found.
              </td>
            </tr>
          )}

          {!isLoading && !loadError && events.map((event) => (
            <tr key={event.id} className="border-b border-rose-200/70 align-top hover:bg-rose-200/40">
              <td className="px-3 py-2 text-rose-900">{formatDateTime(event.createdAt)}</td>
              <td className="px-3 py-2 text-rose-900">{event.eventType}</td>
              <td className="px-3 py-2 text-rose-900">
                <div className="font-medium">{event.user?.displayName ?? '-'}</div>
                <div className="text-xs">{event.user?.email ?? '-'}</div>
                <div className="font-mono text-[11px] text-rose-700">{event.userId}</div>
              </td>
              <td className="px-3 py-2 text-rose-900">{event.ipAddress ?? '-'}</td>
              <td className="px-3 py-2 font-mono text-xs text-rose-900">{metadataValue(event.metadata, 'roomId')}</td>
              <td className="px-3 py-2 font-mono text-xs text-rose-900">{metadataValue(event.metadata, 'socketId')}</td>
              <td className="px-3 py-2 font-mono text-xs text-rose-900">{metadataValue(event.metadata, 'requestId')}</td>
              <td className="px-3 py-2 text-rose-900" title={metadataValue(event.metadata, 'userAgent')}>
                {truncateText(metadataValue(event.metadata, 'userAgent'), 90)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
