import type { FormEvent } from 'react'
import { EMAIL_MAX } from '../../modules/auth/constants'

type ForgotPasswordModalProps = {
  isOpen: boolean
  email: string
  setEmail: (value: string) => void
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onClose: () => void
}

export function ForgotPasswordModal({
  isOpen,
  email,
  setEmail,
  isSubmitting,
  onSubmit,
  onClose,
}: ForgotPasswordModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-md border border-rose-300 bg-rose-50 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-rose-700">Reset Password</h2>
        <p className="mb-4 text-sm text-rose-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              value={email}
              maxLength={EMAIL_MAX}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alice@example.com"
              required
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-rose-300 bg-rose-100 px-4 py-2 font-medium text-rose-700 hover:bg-rose-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
