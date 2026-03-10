import { useState, useMemo, type FormEvent } from 'react'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../modules/auth/constants'
import { createAuthApi } from '../modules/auth/api/authApi'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { useSearchParams } from "react-router-dom"

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [notice, setNotice] = useState<Notice | null>(null)
  
  const authApi = useMemo(
    () => createAuthApi(import.meta.env.VITE_BACKEND_URL),
    []
  )

  const [token] = useState<string | null>(() => {
    const search = new URLSearchParams(searchParams)
    return search.get('token')
  })

  const [resultStatus, setResultStatus] = useState<'success' | 'error' | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)

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
      const result = await authApi.resetPassword(token, newPassword)
      setResultStatus(result.status)
      setResultMessage(result.message)
    } catch (error: unknown) {
      const message = mapErrorToMessage(error)
      setResultStatus('error')
      setResultMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-6 max-w-2xl"> 
        {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}
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
                <div className="rounded-md border border-green-300 bg-green-100 p-4">
                  <h2 className="mb-2 text-lg font-semibold text-green-700">
                    Password Reset Successful
                  </h2>
                  <p className="text-sm text-green-600">
                    Password reset successfully. Proceed to the app to login.
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-red-300 bg-red-100 p-4">
                  <h2 className="mb-2 text-lg font-semibold text-red-700">
                    Password Reset Failed
                  </h2>
                  <p className="text-sm text-red-600">
                    {resultMessage || 'An error occurred while resetting your password. Please try again.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
