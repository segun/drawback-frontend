import type { AdminAppConfigProvider, AdminUserDetail } from '../types'

type AdminUserDetailPanelProps = {
  user: AdminUserDetail | null
  isLoading: boolean
  error: string | null
  userAppConfigProvider: AdminAppConfigProvider
  userAppConfigTemporaryDiscoveryAccessDurationMinutes: number
  isLoadingUserAppConfig: boolean
  userAppConfigError: string | null
  isSavingUserAppConfig: boolean
  isClearingUserAppConfig: boolean
  onUserAppConfigProviderChange: (value: AdminAppConfigProvider) => void
  onUserAppConfigTemporaryDiscoveryAccessDurationMinutesChange: (value: number) => void
  onSaveUserAppConfig: () => void
  onClearUserAppConfig: () => void
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

export function AdminUserDetailPanel({
  user,
  isLoading,
  error,
  userAppConfigProvider,
  userAppConfigTemporaryDiscoveryAccessDurationMinutes,
  isLoadingUserAppConfig,
  userAppConfigError,
  isSavingUserAppConfig,
  isClearingUserAppConfig,
  onUserAppConfigProviderChange,
  onUserAppConfigTemporaryDiscoveryAccessDurationMinutesChange,
  onSaveUserAppConfig,
  onClearUserAppConfig,
  onClose,
}: AdminUserDetailPanelProps) {
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
        <div className="flex flex-col gap-4">
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

          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="mb-1 text-base font-semibold text-rose-900">App Config</div>
            <p className="mb-3 text-sm text-rose-700">
              Edit this user's effective app config here. Clearing reverts the user back to the global app config.
            </p>

            {isLoadingUserAppConfig && <p className="mb-3 text-sm text-rose-700">Loading user app config...</p>}
            {userAppConfigError && <p className="mb-3 text-sm text-red-700">{userAppConfigError}</p>}

            <label className="flex flex-col gap-1 text-sm text-rose-900">
              Ads Provider
              <input
                type="text"
                value={userAppConfigProvider}
                onChange={(event) => onUserAppConfigProviderChange(event.target.value as AdminAppConfigProvider)}
                disabled={isLoadingUserAppConfig || isSavingUserAppConfig || isClearingUserAppConfig}
                className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="mt-3 flex flex-col gap-1 text-sm text-rose-900">
              Temporary Discovery Access Duration (minutes)
              <input
                type="number"
                min={1}
                step={1}
                value={userAppConfigTemporaryDiscoveryAccessDurationMinutes}
                onChange={(event) => onUserAppConfigTemporaryDiscoveryAccessDurationMinutesChange(Number(event.target.value))}
                disabled={isLoadingUserAppConfig || isSavingUserAppConfig || isClearingUserAppConfig}
                className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSaveUserAppConfig}
                disabled={isLoadingUserAppConfig || isSavingUserAppConfig || isClearingUserAppConfig}
                className="rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingUserAppConfig ? 'Saving...' : 'Save User Override'}
              </button>
              <button
                type="button"
                onClick={onClearUserAppConfig}
                disabled={isLoadingUserAppConfig || isSavingUserAppConfig || isClearingUserAppConfig}
                className="rounded-md border border-rose-600 bg-transparent px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isClearingUserAppConfig ? 'Clearing...' : 'Clear Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
