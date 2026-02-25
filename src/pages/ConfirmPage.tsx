import { useEffect } from 'react'
import { useSearch, useLocation } from 'wouter'
import { Header } from '../components/common/Header'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'

type ConfirmPageProps = {
  notice: Notice | null
  onDismissNotice: () => void
  setNotice: (notice: Notice) => void
  setLoginEmail: (email: string) => void
}

export function ConfirmPage({
  notice,
  onDismissNotice,
  setNotice,
  setLoginEmail,
}: ConfirmPageProps) {
  const searchParams = useSearch()
  const [, setLocation] = useLocation()

  useEffect(() => {
    const query = new URLSearchParams(searchParams)
    const status = query.get('status')
    const emailFromQuery = query.get('email')?.trim()

    if (emailFromQuery) {
      setLoginEmail(emailFromQuery)
    }

    if (status === 'success') {
      setNotice({ text: 'Email confirmed successfully. You can now log in.', type: 'success' })
      setLocation('/login')
      return
    }

    if (status === 'error') {
      const reason = query.get('reason')?.trim()
      setNotice({
        text: reason || 'Invalid or expired activation token.',
        type: 'error',
      })
      setLocation('/login')
      return
    }

    setNotice({ text: 'Please log in to continue.', type: 'info' })
    setLocation('/login')
  }, [searchParams, setLoginEmail, setNotice, setLocation])

  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-xl px-4 pb-8">
        {notice && <NoticeBanner notice={notice} onDismiss={onDismissNotice} />}
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          <p className="mb-4 text-sm text-rose-700">
            Redirecting you to login...
          </p>
          <button
            type="button"
            onClick={() => setLocation('/login')}
            className="w-full rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800"
          >
            Go to Login
          </button>
        </div>
      </main>
    </div>
  )
}
