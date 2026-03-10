import { ADMIN_BAN_REASON_MAX } from '../constants'

type AdminBatchActionsProps = {
  selectedCount: number
  banReason: string
  isSubmitting: boolean
  onBanReasonChange: (value: string) => void
  onBanSelected: () => void
  onUnbanSelected: () => void
  onResetPasswords: () => void
  onClearSelection: () => void
}

export function AdminBatchActions({
  selectedCount,
  banReason,
  isSubmitting,
  onBanReasonChange,
  onBanSelected,
  onUnbanSelected,
  onResetPasswords,
  onClearSelection,
}: AdminBatchActionsProps) {
  const disabled = selectedCount === 0 || isSubmitting

  return (
    <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
      <h2 className="text-base font-semibold text-rose-900">Batch Actions</h2>
      <p className="mt-1 text-sm text-rose-700">Selected users: {selectedCount}</p>

      <label className="mt-3 flex flex-col gap-1 text-sm text-rose-800">
        Ban Reason (optional)
        <textarea
          value={banReason}
          maxLength={ADMIN_BAN_REASON_MAX}
          onChange={(event) => onBanReasonChange(event.target.value)}
          placeholder="Reason for ban"
          rows={2}
          className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
        />
        <span className="text-xs text-rose-700">{banReason.length}/{ADMIN_BAN_REASON_MAX}</span>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onBanSelected}
          className="rounded-md border border-red-700 bg-red-700 px-3 py-2 text-sm font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Ban Selected
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onUnbanSelected}
          className="rounded-md border border-green-700 bg-green-700 px-3 py-2 text-sm font-medium text-green-100 hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Unban Selected
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onResetPasswords}
          className="rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send Password Reset Emails
        </button>
        <button
          type="button"
          disabled={selectedCount === 0 || isSubmitting}
          onClick={onClearSelection}
          className="rounded-md border border-rose-600 bg-transparent px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Clear Selection
        </button>
      </div>
    </section>
  )
}
