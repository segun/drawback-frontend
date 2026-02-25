import { Link } from 'wouter'
import type { FormEvent } from 'react'
import { Header } from '../components/common/Header'
import { RegisterForm } from '../components/auth/RegisterForm'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'

type RegisterPageProps = {
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  confirmPassword: string
  setConfirmPassword: (value: string) => void
  displayName: string
  setDisplayName: (value: string) => void
  normalizeDisplayNameInput: (value: string) => string
  displayNameAvailability: 'idle' | 'invalid' | 'checking' | 'available' | 'taken'
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  notice: Notice | null
  onDismissNotice: () => void
}

export function RegisterPage({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  displayName,
  setDisplayName,
  normalizeDisplayNameInput,
  displayNameAvailability,
  isSubmitting,
  onSubmit,
  notice,
  onDismissNotice,
}: RegisterPageProps) {
  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-xl px-4 pb-8">
        {notice && <NoticeBanner notice={notice} onDismiss={onDismissNotice} />}
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-rose-700">Create Account</h1>
            <Link href="/login" className="text-sm font-medium text-rose-700 underline underline-offset-2 hover:text-rose-800">
              Already have an account? Login
            </Link>
          </div>
          
          <p className="mb-4 text-sm text-rose-700">
            Register with email, password, and display name. Login is allowed only after email
            confirmation.
          </p>

          <RegisterForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            displayName={displayName}
            setDisplayName={setDisplayName}
            normalizeDisplayNameInput={normalizeDisplayNameInput}
            displayNameAvailability={displayNameAvailability}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>
      </main>
    </div>
  )
}
