import type { AdminUser } from '../types'

type AdminUsersTableProps = {
  users: AdminUser[]
  isLoading: boolean
  loadError: string | null
  selectedUserIds: Set<string>
  onToggleUser: (userId: string, checked: boolean) => void
  onToggleAllVisible: (checked: boolean) => void
  onViewDetails: (userId: string) => void
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

const renderBoolean = (value: boolean | undefined): string => {
  if (value === undefined) {
    return '-'
  }

  return value ? 'Yes' : 'No'
}

export function AdminUsersTable({
  users,
  isLoading,
  loadError,
  selectedUserIds,
  onToggleUser,
  onToggleAllVisible,
  onViewDetails,
}: AdminUsersTableProps) {
  const allVisibleSelected = users.length > 0 && users.every((user) => selectedUserIds.has(user.id))

  return (
    <div className="overflow-x-auto rounded-lg border border-rose-300 bg-rose-100 shadow-sm shadow-rose-300/30">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-rose-300 text-rose-800">
            <th className="px-3 py-2">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={(event) => onToggleAllVisible(event.target.checked)}
                aria-label="Select all users on this page"
              />
            </th>
            <th className="px-3 py-2">Display Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Mode</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Blocked</th>
            <th className="px-3 py-2">Activated</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={9} className="px-3 py-5 text-center text-rose-700">
                Loading users...
              </td>
            </tr>
          )}

          {!isLoading && loadError && (
            <tr>
              <td colSpan={9} className="px-3 py-5 text-center text-red-700">
                {loadError}
              </td>
            </tr>
          )}

          {!isLoading && !loadError && users.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-5 text-center text-rose-700">
                No users found.
              </td>
            </tr>
          )}

          {!isLoading && !loadError && users.map((user) => {
            const isSelected = selectedUserIds.has(user.id)

            return (
              <tr key={user.id} className="border-b border-rose-200/70 hover:bg-rose-200/40">
                <td className="px-3 py-2 align-top">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(event) => onToggleUser(user.id, event.target.checked)}
                    aria-label={`Select ${user.displayName}`}
                  />
                </td>
                <td className="px-3 py-2 align-top font-medium text-rose-900">{user.displayName}</td>
                <td className="px-3 py-2 align-top text-rose-900">{user.email}</td>
                <td className="px-3 py-2 align-top text-rose-900">{user.mode}</td>
                <td className="px-3 py-2 align-top text-rose-900">{user.role ?? '-'}</td>
                <td className="px-3 py-2 align-top">
                  <span className={user.isBlocked ? 'font-semibold text-red-700' : 'text-green-700'}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-3 py-2 align-top text-rose-900">{renderBoolean(user.isActivated)}</td>
                <td className="px-3 py-2 align-top text-rose-900">{formatDateTime(user.createdAt)}</td>
                <td className="px-3 py-2 align-top">
                  <button
                    type="button"
                    onClick={() => onViewDetails(user.id)}
                    className="rounded-md border border-rose-700 bg-rose-700 px-2 py-1 text-xs font-medium text-rose-100 hover:bg-rose-800"
                  >
                    Details
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
