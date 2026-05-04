import type { AdminSessionStat } from '../types'

type AdminSessionStatsTableProps = {
  stats: AdminSessionStat[]
  isLoading: boolean
  loadError: string | null
}

const formatSeconds = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (minutes < 60) return remaining > 0 ? `${minutes}m ${remaining}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function AdminSessionStatsTable({ stats, isLoading, loadError }: AdminSessionStatsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-rose-300 bg-rose-100 shadow-sm shadow-rose-300/30">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-rose-300 text-rose-800">
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2">Invited By</th>
            <th className="px-3 py-2">Period</th>
            <th className="px-3 py-2 text-right">Sessions</th>
            <th className="px-3 py-2 text-right">Total Time</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-3 py-5 text-center text-rose-700">
                Loading session stats...
              </td>
            </tr>
          )}

          {!isLoading && loadError && (
            <tr>
              <td colSpan={5} className="px-3 py-5 text-center text-red-700">
                {loadError}
              </td>
            </tr>
          )}

          {!isLoading && !loadError && stats.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-5 text-center text-rose-700">
                No session stats found.
              </td>
            </tr>
          )}

          {!isLoading && !loadError && stats.map((stat, index) => (
            <tr
              key={`${stat.userId}-${stat.period}-${index}`}
              className="border-b border-rose-200/70 align-top hover:bg-rose-200/40"
            >
              <td className="px-3 py-2 text-rose-900">
                <div className="font-medium">{stat.displayName}</div>
              </td>
              <td className="px-3 py-2 text-rose-900">
                {stat.invitedByUser
                  ? <div className="font-medium">{stat.invitedByUser}</div>
                  : <span className="text-rose-500">—</span>}
              </td>
              <td className="px-3 py-2 font-mono text-rose-900">{stat.period}</td>
              <td className="px-3 py-2 text-right text-rose-900">{stat.sessionCount}</td>
              <td className="px-3 py-2 text-right text-rose-900">{formatSeconds(stat.totalSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
