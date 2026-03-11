import type { AdminSocketConnection } from '../types'

type AdminSocketsTableProps = {
  sockets: AdminSocketConnection[]
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

const truncateUserAgent = (value: string): string => {
  if (!value) {
    return '-'
  }

  if (value.length <= 80) {
    return value
  }

  return `${value.slice(0, 77)}...`
}

export function AdminSocketsTable({ sockets, isLoading, loadError }: AdminSocketsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-rose-300 bg-rose-100 shadow-sm shadow-rose-300/30">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-rose-300 text-rose-800">
            <th className="px-3 py-2">Display Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Socket ID</th>
            <th className="px-3 py-2">Connected</th>
            <th className="px-3 py-2">Room</th>
            <th className="px-3 py-2">IP Address</th>
            <th className="px-3 py-2">User Agent</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={7} className="px-3 py-5 text-center text-rose-700">
                Loading socket connections...
              </td>
            </tr>
          )}

          {!isLoading && loadError && (
            <tr>
              <td colSpan={7} className="px-3 py-5 text-center text-red-700">
                {loadError}
              </td>
            </tr>
          )}

          {!isLoading && !loadError && sockets.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-5 text-center text-rose-700">
                No active socket connections found.
              </td>
            </tr>
          )}

          {!isLoading && !loadError && sockets.map((socket) => (
            <tr key={socket.socketId} className="border-b border-rose-200/70 hover:bg-rose-200/40">
              <td className="px-3 py-2 align-top font-medium text-rose-900">{socket.userDisplayName}</td>
              <td className="px-3 py-2 align-top text-rose-900">{socket.userEmail}</td>
              <td className="px-3 py-2 align-top font-mono text-xs text-rose-900">{socket.socketId}</td>
              <td className="px-3 py-2 align-top text-rose-900">{formatDateTime(socket.connectedAt)}</td>
              <td className="px-3 py-2 align-top text-rose-900">{socket.currentRoom ?? '-'}</td>
              <td className="px-3 py-2 align-top text-rose-900">{socket.ipAddress || '-'}</td>
              <td className="px-3 py-2 align-top text-rose-900" title={socket.userAgent}>
                {truncateUserAgent(socket.userAgent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}