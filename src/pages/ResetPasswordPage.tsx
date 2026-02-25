import { useLocation, useSearch } from 'wouter'
import { useState, type FormEvent } from 'react'
import { Header } from '../components/common/Header'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../modules/auth/constants'
import type { ResetPasswordResponse } from '../modules/auth/api/authApi'

type ResetPasswordPageProps = {
  notice: Notice | null
  onDismissNotice: () => void
  setNotice: (notice: Notice) => void
  onResetPassword: (token: string, email: string, password: string) => Promise<ResetPasswordResponse>
  setLoginEmail: (email: string) => void
}

export function ResetPasswordPage({
  notice,
  onDismissNotice,
  setNotice,
  onResetPassword,
  setLoginEmail,
}: ResetPasswordPageProps) {
  const [, setLocation] = useLocation()
  const searchParams = useSearch()

  const [token] = useState<string | null>(() => {
    const search = new URLSearchParams(searchParams)
    return search.get('token')
  })

  const [resultStatus, setResultStatus] = useState<'success' | 'error' | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [resultEmail, setResultEmail] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setNotice({ text: 'Email is required.', type: 'error' })
      return
    }

    if (!newPassword) {
      setNotice({ text: 'Password is required.', type: 'error' })
      return
    }

    if (newPassword.length < PASSWORD_MIN || newPassword.length > PASSWORD_MAX) {
      setNotice({ text: `Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`, type: 'error' })
      return
    }

    if (newPassword !== confirmPassword) {
      setNotice({ text: 'Passwords do not match.', type: 'error' })
      return
    }

    if (!token) {
      setNotice({ text: 'Invalid reset token.', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onResetPassword(token, trimmedEmail, newPassword)
      setResultStatus(result.status)
      setResultMessage(result.message)
      setResultEmail(result.email ?? trimmedEmail)
    } catch (error: any) {
      const message = error?.message || 'An error occurred while resetting your password.'
      setResultStatus('error')
      setResultMessage(message)
      setResultEmail(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToLogin = () => {
    setLoginEmail(resultEmail || email)
    setLocation('/login')
  }

  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-xl px-4 pb-8">
        {notice && <NoticeBanner notice={notice} onDismiss={onDismissNotice} />}
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          {token && !resultStatus && (
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <h2 className="text-lg font-semibold text-rose-700">Reset Your Password</h2>
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
              <label className="flex flex-col gap-1 text-sm">
                New Password
                <input
                  type="password"
                  value={newPassword}
                  maxLength={PASSWORD_MAX}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Confirm Password
                <input
                  type="password"
                  value={confirmPassword}
                  maxLength={PASSWORD_MAX}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          {resultStatus && (
            <div className="flex flex-col gap-4">
              {resultStatus === 'success' ? (
                <>
                  <div className="rounded-md border border-green-300 bg-green-100 p-4">
                    <h2 className="mb-2 text-lg font-semibold text-green-700">
                      Password Reset Successful
                    </h2>
                    <p className="text-sm text-green-600">
                      {resultMessage || 'Your password has been reset successfully. You can now log in with your new password.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGoToLogin}
                    className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800"
                  >
                    Go to Login
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-md border border-red-300 bg-red-100 p-4">
                    <h2 className="mb-2 text-lg font-semibold text-red-700">
                      Password Reset Failed
                    </h2>
                    <p className="text-sm text-red-600">
                      {resultMessage || 'An error occurred while resetting your password. Please try again.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocation('/login')}
                    className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
