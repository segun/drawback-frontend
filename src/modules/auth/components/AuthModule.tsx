import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError } from '../../../common/api/apiError'
import { NoticeBanner, type Notice } from '../../../common/components/NoticeBanner'
import { createAuthApi } from '../api/authApi'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../constants'
import { isValidDisplayName } from '../utils/displayName'

type AuthTab = 'register' | 'login'

export function AuthModule() {
  const authApi = useMemo(() => createAuthApi(String(import.meta.env.VITE_BACKEND_URL ?? '').trim()), [])
  const [isConfirmRoute] = useState<boolean>(() => typeof window !== 'undefined' && window.location.pathname === '/confirm')

  const [tab, setTab] = useState<AuthTab>(() => (typeof window !== 'undefined' && window.location.pathname === '/confirm' ? 'login' : 'register'))
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerDisplayName, setRegisterDisplayName] = useState('@')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [accessToken, setAccessToken] = useState<string | null>(() => authApi.getAccessToken())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)

  const showNotice = (text: string, type: Notice['type'] = 'info'): void => {
    setNotice({ text, type })
  }

  const normalizeRegisterDisplayNameInput = (value: string): string => {
    const trimmedValue = value.trimStart()
    if (!trimmedValue) {
      return '@'
    }

    return trimmedValue.startsWith('@') ? trimmedValue : `@${trimmedValue}`
  }

  const validateRegisterInput = (): string | null => {
    const email = registerEmail.trim()
    const password = registerPassword
    const displayName = registerDisplayName.trim()

    if (!email || email.length > EMAIL_MAX) {
      return 'Email is required and must be at most 254 characters.'
    }

    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      return 'Password must be between 8 and 72 characters.'
    }

    if (!isValidDisplayName(displayName)) {
      return 'Display name must match ^@[a-zA-Z0-9_]{3,29}$.'
    }

    return null
  }

  const mapErrorToMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.status === 400) {
        return error.message || 'Validation failed. Please check your input.'
      }
      if (error.status === 401) {
        return error.message || 'Invalid credentials or account not activated yet.'
      }
      if (error.status === 409) {
        return error.message || 'Email or display name is already in use.'
      }
      return error.message || `Request failed with status ${error.status}.`
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Something went wrong. Please try again.'
  }

  useEffect(() => {
    if (!isConfirmRoute) {
      return
    }

    setTab('login')

    const query = new URLSearchParams(window.location.search)
    const status = query.get('status')
    const emailFromQuery = query.get('email')?.trim()

    if (emailFromQuery) {
      setLoginEmail(emailFromQuery)
    }

    if (status === 'success') {
      setNotice({ text: 'Email confirmed successfully. You can now log in.', type: 'success' })
      setShowResendConfirmation(false)
      return
    }

    if (status === 'error') {
      const reason = query.get('reason')?.trim()
      setNotice({
        text: reason || 'Invalid or expired activation token. Please request a new confirmation email.',
        type: 'error',
      })
      setShowResendConfirmation(true)
      return
    }

    setNotice({ text: 'Please log in to continue.', type: 'info' })
  }, [isConfirmRoute])

  const register = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    const validationError = validateRegisterInput()
    if (validationError) {
      showNotice(validationError, 'error')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.register({
        email: registerEmail,
        password: registerPassword,
        displayName: registerDisplayName,
      })
      showNotice('Registration successful. Please check your email to activate your account.', 'success')
      setLoginEmail(registerEmail.trim())
      setRegisterPassword('')
      setTab('login')
      setShowResendConfirmation(true)
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resendConfirmation = async (): Promise<void> => {
    const email = loginEmail.trim() || registerEmail.trim()
    if (!email) {
      showNotice('Enter your email first to resend confirmation.', 'error')
      return
    }

    setIsResendingConfirmation(true)
    try {
      const response = await authApi.resendConfirmation({ email })
      showNotice(response.message || 'Confirmation email resent. Please check your inbox.', 'info')
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsResendingConfirmation(false)
    }
  }

  const login = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (!loginEmail.trim()) {
      showNotice('Email is required.', 'error')
      return
    }

    if (!loginPassword) {
      showNotice('Password is required.', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authApi.login({ email: loginEmail, password: loginPassword })
      setAccessToken(response.accessToken)
      setLoginPassword('')
      showNotice('Login successful. Welcome back.', 'success')
    } catch (error) {
      showNotice(mapErrorToMessage(error), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = (): void => {
    authApi.logout()
    setAccessToken(null)
    showNotice('You have been logged out.', 'info')
  }

  return (
    <main className="min-h-screen bg-rose-0 text-rose-800">
      <header className="mb-6 border-b border-rose-300 bg-rose-200/80">
        <nav className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
          <img src="/images/logo/logo_main.jpg" alt="DrawkcaB logo" className="h-12 w-36 rounded-md border border-rose-300 object-cover" />
          <span className="rounded-md border border-rose-400 bg-rose-300 px-3 py-1 text-sm font-medium">
            {accessToken ? 'Signed in' : 'Signed out'}
          </span>
        </nav>
      </header>

      <div className="mx-auto max-w-xl px-4 pb-8">
        <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          <h1 className="mb-2 text-xl font-semibold">Auth</h1>
          <p className="mb-4 text-sm text-rose-700">Register with email, password, and display name. Login is allowed only after email confirmation.</p>

          {!isConfirmRoute && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  tab === 'register' ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                }`}
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  tab === 'login' ? 'border-rose-700 bg-rose-700 text-rose-100' : 'border-rose-300 bg-rose-100 text-rose-700'
                }`}
              >
                Login
              </button>
            </div>
          )}

          {!accessToken && tab === 'register' && (
            <form className="flex flex-col gap-3" onSubmit={register}>
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  type="email"
                  value={registerEmail}
                  maxLength={EMAIL_MAX}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="alice@example.com"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Password
                <input
                  type="password"
                  value={registerPassword}
                  minLength={PASSWORD_MIN}
                  maxLength={PASSWORD_MAX}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Display name
                <input
                  type="text"
                  value={registerDisplayName}
                  onChange={(event) => setRegisterDisplayName(normalizeRegisterDisplayNameInput(event.target.value))}
                  placeholder="@alice"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <p className="text-xs text-rose-600">Must match ^@[a-zA-Z0-9_]{'{'}3,29{'}'}$</p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Registering…' : 'Create account'}
              </button>
            </form>
          )}

          {!accessToken && tab === 'login' && (
            <form className="flex flex-col gap-3" onSubmit={login}>
              <label className="flex flex-col gap-1 text-sm">
                Email
                <input
                  type="email"
                  value={loginEmail}
                  maxLength={EMAIL_MAX}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  placeholder="alice@example.com"
                  required
                  className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Password
                <input
                  type="password"
                  value={loginPassword}
                  maxLength={PASSWORD_MAX}
                  onChange={(event) => setLoginPassword(event.target.value)}
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
                {isSubmitting ? 'Logging in…' : 'Login'}
              </button>

              {showResendConfirmation && (
                <button
                  type="button"
                  onClick={resendConfirmation}
                  disabled={isResendingConfirmation}
                  className="rounded-md border border-rose-700 bg-rose-100 px-4 py-2 font-medium text-rose-700 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isResendingConfirmation ? 'Resending…' : 'Resend confirmation email'}
                </button>
              )}
            </form>
          )}

          {accessToken && (
            <div className="mt-4 rounded-md border border-rose-300 bg-rose-200 p-3">
              <p className="mb-2 text-sm text-rose-700">You are signed in.</p>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-rose-700 bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200"
              >
                Logout
              </button>
            </div>
          )}
        </section>

        <NoticeBanner notice={notice} />
      </div>
    </main>
  )
}
