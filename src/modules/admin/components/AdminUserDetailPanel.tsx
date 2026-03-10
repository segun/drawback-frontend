import type { AdminUserDetail } from '../types'

type AdminUserDetailPanelProps = {
  user: AdminUserDetail | null
  isLoading: boolean
  error: string | null
  onClose: () => void
}

const formatValue = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}

const formatDate = (value: string | null): string => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

export function AdminUserDetailPanel({ user, isLoading, error, onClose }: AdminUserDetailPanelProps) {
  if (!isLoading && !error && !user) {
    return null
  }

  return (
    <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-rose-900">User Details</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
        >
          Close
        </button>
      </div>

      {isLoading && <p className="text-sm text-rose-700">Loading user details...</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!isLoading && !error && user && (
        <div className="grid gap-2 text-sm text-rose-900 md:grid-cols-2">
          <div><strong>ID:</strong> {formatValue(user.id)}</div>
          <div><strong>Email:</strong> {formatValue(user.email)}</div>
          <div><strong>Display Name:</strong> {formatValue(user.displayName)}</div>
          <div><strong>Role:</strong> {formatValue(user.role)}</div>
          <div><strong>Mode:</strong> {formatValue(user.mode)}</div>
          <div><strong>Blocked:</strong> {formatValue(user.isBlocked)}</div>
          <div><strong>Blocked At:</strong> {formatDate(user.blockedAt)}</div>
          <div><strong>Blocked Reason:</strong> {formatValue(user.blockedReason)}</div>
          <div><strong>Activated:</strong> {formatValue(user.isActivated)}</div>
          <div><strong>Appear In Searches:</strong> {formatValue(user.appearInSearches)}</div>
          <div><strong>Appear In Discovery:</strong> {formatValue(user.appearInDiscoveryGame)}</div>
          <div><strong>Discovery Access:</strong> {formatValue(user.hasDiscoveryAccess)}</div>
          <div><strong>Discovery Image URL:</strong> {formatValue(user.discoveryImageUrl)}</div>
          <div><strong>Activation Token Expiry:</strong> {formatDate(user.activationTokenExpiry)}</div>
          <div><strong>Reset Token Expiry:</strong> {formatDate(user.resetTokenExpiry)}</div>
          <div><strong>Delete Token Expiry:</strong> {formatDate(user.deleteTokenExpiry)}</div>
          <div><strong>Created:</strong> {formatDate(user.createdAt)}</div>
          <div><strong>Updated:</strong> {formatDate(user.updatedAt)}</div>
        </div>
      )}
    </section>
  )
}
