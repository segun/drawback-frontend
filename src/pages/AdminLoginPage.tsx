import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/landing/Navbar'
import Footer from '../components/landing/Footer'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { getJwtPayloadFromToken, hasAdminRole, isJwtExpired, type AdminJwtPayload } from '../common/utils/jwt'
import { createAuthApi } from '../modules/auth/api/authApi'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../modules/auth/constants'

type AdminLoginLocationState = {
  noticeText?: string
  noticeType?: Notice['type']
}

export function AdminLoginPage() {
  const [notice, setNotice] = useState<Notice | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  const authApi = useMemo(() => createAuthApi(import.meta.env.VITE_BACKEND_URL), [])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const state = location.state as AdminLoginLocationState | null
    if (state?.noticeText) {
      setNotice({
        text: state.noticeText,
        type: state.noticeType ?? 'info',
      })
    }
  }, [location.state])

  useEffect(() => {
    const token = authApi.getAccessToken()

    if (!token) {
      setIsCheckingToken(false)
      return
    }

    const payload = getJwtPayloadFromToken<AdminJwtPayload>(token)
    const canAccessDashboard = payload && hasAdminRole(payload) && !isJwtExpired(payload)

    if (canAccessDashboard) {
      navigate('/admin/dashboard', { replace: true })
      return
    }

    authApi.logout()
    setIsCheckingToken(false)
  }, [authApi, navigate])

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

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setNotice({
        text: `Password must be between ${PASSWORD_MIN} and ${PASSWORD_MAX} characters.`,
        type: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authApi.login({ email: trimmedEmail, password })
      const payload = getJwtPayloadFromToken<AdminJwtPayload>(result.accessToken)

      if (!payload || isJwtExpired(payload) || !hasAdminRole(payload)) {
        authApi.logout()
        setNotice({ text: 'This account does not have admin access.', type: 'error' })
        return
      }

      navigate('/admin/dashboard', { replace: true })
    } catch (error: unknown) {
      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto max-w-lg px-6">
          {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}
          <section className="rounded-xl border border-rose-300 bg-rose-100 p-6 shadow-sm shadow-rose-300/30">
            <h1 className="text-2xl font-semibold text-rose-900">Admin Login</h1>
            <p className="mt-1 text-sm text-rose-700">Sign in with an account that has the ADMIN role.</p>

            {isCheckingToken ? (
              <p className="mt-4 text-sm text-rose-700">Checking existing admin session...</p>
            ) : (
              <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-1 text-sm text-rose-900">
                  Email
                  <input
                    type="email"
                    value={email}
                    maxLength={EMAIL_MAX}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-rose-900">
                  Password
                  <input
                    type="password"
                    value={password}
                    maxLength={PASSWORD_MAX}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Your password"
                    required
                    className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
