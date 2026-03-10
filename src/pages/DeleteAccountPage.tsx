import { useState, useMemo, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { EMAIL_MAX, PASSWORD_MAX } from '../modules/auth/constants'
import { createAuthApi } from '../modules/auth/api/authApi'
import { mapErrorToMessage } from '../common/utils/errorMapper'

export function DeleteAccountPage() {
  const [searchParams] = useSearchParams()
  const [notice, setNotice] = useState<Notice | null>(null)

  const authApi = useMemo(
    () => createAuthApi(import.meta.env.VITE_BACKEND_URL),
    []
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [resultStatus, setResultStatus] = useState<'success' | 'error' | null>(() => {
    const status = searchParams.get('status')
    if (status === 'success') return 'success'
    if (status === 'fail') return 'error'
    return null
  })

  const [deleteMessage, setDeleteMessage] = useState<string | null>();

  const [resultMessage, setResultMessage] = useState<string | null>(() => {
    return searchParams.get('message')
  })

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setNotice({ text: 'Email is required.', type: 'error' })
      return
    }

    if (!password) {
      setNotice({ text: 'Password is required.', type: 'error' })
      return
    }

    if (!confirmDelete) {
      setNotice({ text: 'You must confirm that you want to delete your account.', type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authApi.deleteAccount(trimmedEmail, password)
      setResultStatus('success')
      setDeleteMessage(result.message)
      setResultMessage(null)
    } catch (error: unknown) {
      const message = mapErrorToMessage(error)
      setResultStatus('error')
      setDeleteMessage(message)
      setResultMessage(null)
      setNotice({ text: message, type: 'error' })
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
          
          {!resultStatus && (
            <div className="rounded-xl border border-red-300 bg-red-100 p-6 shadow-sm shadow-red-300/30">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <h2 className="text-lg font-semibold text-red-700">Delete My Account</h2>
                
                <p className="text-sm text-red-600">
                  This action is permanent. All your data will be deleted and cannot be recovered.
                </p>

                <label className="flex flex-col gap-1 text-sm">
                  Email
                  <input
                    type="email"
                    value={email}
                    maxLength={EMAIL_MAX}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alice@example.com"
                    required
                    className="rounded-md border border-red-300 bg-red-100 px-3 py-2 outline-none placeholder:text-red-500 focus:border-red-600"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  Password
                  <input
                    type="password"
                    value={password}
                    maxLength={PASSWORD_MAX}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    className="rounded-md border border-red-300 bg-red-100 px-3 py-2 outline-none placeholder:text-red-500 focus:border-red-600"
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    className="rounded border-red-300 text-red-600"
                  />
                  <span className="text-sm text-red-700">
                    I understand this will permanently delete my account and all associated data
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !confirmDelete}
                  className="rounded-md border border-red-700 bg-red-700 px-4 py-2 font-medium text-red-100 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Deleting…' : 'Delete My Account'}
                </button>
              </form>
            </div>
          )}

          {resultStatus === 'success' && (
            <div className="rounded-md border border-green-300 bg-green-100 p-4">
              <h2 className="mb-2 text-lg font-semibold text-green-700">
                {resultMessage ? 'Your account has been deleted' : 'Please check your email'}
              </h2>
              <p className="text-sm text-green-600">
                {resultMessage || deleteMessage || 'Your account has been permanently deleted. Redirecting to home page...'}
              </p>
            </div>
          )}

          {resultStatus === 'error' && (
            <div className="rounded-md border border-red-300 bg-red-100 p-4">
              <h2 className="mb-2 text-lg font-semibold text-red-700">
                Deletion Failed
              </h2>
              <p className="text-sm text-red-600">
                {resultMessage || deleteMessage || 'An error occurred while deleting your account. Please try again.'}
              </p>
              <button
                onClick={() => {
                  setResultStatus(null)
                  setEmail('')
                  setPassword('')
                  setConfirmDelete(false)
                }}
                className="mt-4 rounded-md border border-red-700 bg-red-700 px-3 py-1 text-sm font-medium text-red-100 hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
