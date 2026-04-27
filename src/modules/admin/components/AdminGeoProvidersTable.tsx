import type { GeoProvider } from '../types'

type AdminGeoProvidersTableProps = {
  providers: GeoProvider[]
  onEdit: (provider: GeoProvider) => void
  onDelete: (id: string) => void
  isLoading: boolean
}

const statusBadgeClass = (status: GeoProvider['status']): string => {
  switch (status) {
    case 'healthy':
      return 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
    case 'degraded':
      return 'rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800'
    case 'down':
      return 'rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800'
    default:
      return 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700'
  }
}

export function AdminGeoProvidersTable({
  providers,
  onEdit,
  onDelete,
  isLoading,
}: AdminGeoProvidersTableProps) {
  if (isLoading) {
    return <p className="py-6 text-center text-sm text-rose-600">Loading...</p>
  }

  if (providers.length === 0) {
    return <p className="py-6 text-center text-sm text-rose-700">No geo providers found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-rose-200 text-left text-xs font-semibold uppercase tracking-wide text-rose-700">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">URL Template</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Sort Order</th>
            <th className="py-2 pr-4">Enabled</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => (
            <tr key={provider.id} className="border-b border-rose-100 last:border-0">
              <td className="py-2 pr-4 font-medium text-rose-900">{provider.name}</td>
              <td className="max-w-xs py-2 pr-4 text-rose-700">
                <span className="block truncate font-mono text-xs" title={provider.urlTemplate}>
                  {provider.urlTemplate}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className={statusBadgeClass(provider.status)}>{provider.status}</span>
              </td>
              <td className="py-2 pr-4 text-rose-700">{provider.sortOrder}</td>
              <td className="py-2 pr-4">
                <span
                  className={
                    provider.isEnabled
                      ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
                      : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                  }
                >
                  {provider.isEnabled ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="py-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(provider)}
                    className="rounded border border-rose-500 px-2 py-0.5 text-xs font-medium text-rose-700 hover:bg-rose-200/60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(provider.id)}
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
  )
}
