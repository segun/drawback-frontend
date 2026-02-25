import { Link } from 'wouter'
import type { FormEvent } from 'react'
import { Header } from '../components/common/Header'
import { LoginForm } from '../components/auth/LoginForm'
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'

type LoginPageProps = {
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  showForgotPasswordModal: boolean
  setShowForgotPasswordModal: (value: boolean) => void
  forgotPasswordEmail: string
  setForgotPasswordEmail: (value: string) => void
  onForgotPassword: (event: FormEvent<HTMLFormElement>) => Promise<void>
  notice: Notice | null
  onDismissNotice: () => void
}

export function LoginPage({
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  onSubmit,
  showForgotPasswordModal,
  setShowForgotPasswordModal,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  onForgotPassword,
  notice,
  onDismissNotice,
}: LoginPageProps) {
  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-xl px-4 pb-8">
        {notice && <NoticeBanner notice={notice} onDismiss={onDismissNotice} />}
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-rose-700">Login</h1>
            <Link href="/register" className="text-sm font-medium text-rose-700 underline underline-offset-2 hover:text-rose-800">
              Need an account? Register
            </Link>
          </div>

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onForgotPassword={() => setShowForgotPasswordModal(true)}
          />
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        email={forgotPasswordEmail}
        setEmail={setForgotPasswordEmail}
        isSubmitting={isSubmitting}
        onSubmit={onForgotPassword}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}
