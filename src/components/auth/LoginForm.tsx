import type { FormEvent } from 'react'
import { EMAIL_MAX, PASSWORD_MAX } from '../../modules/auth/constants'

type LoginFormProps = {
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void
  isSubmitting: boolean
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onForgotPassword: () => void
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  onSubmit,
  onForgotPassword,
}: LoginFormProps) {
  return (
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

      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          value={password}
          maxLength={PASSWORD_MAX}
          onChange={(e) => setPassword(e.target.value)}
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

      <button
        type="button"
        onClick={onForgotPassword}
        className="text-center text-sm font-medium text-rose-700 underline underline-offset-2 hover:text-rose-800"
      >
        Forgot Password?
      </button>
    </form>
  )
}
