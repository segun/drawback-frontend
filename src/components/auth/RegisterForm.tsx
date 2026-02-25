import type { FormEvent } from 'react'
import { EMAIL_MAX, PASSWORD_MAX, PASSWORD_MIN } from '../../modules/auth/constants'

type RegisterFormProps = {
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
}

export function RegisterForm({
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
}: RegisterFormProps) {
  return (
    <>
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
            minLength={PASSWORD_MIN}
            maxLength={PASSWORD_MAX}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
            className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
          />
        </label>

        <div className="flex flex-col gap-1">
          <label className="flex flex-col gap-1 text-sm">
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              minLength={PASSWORD_MIN}
              maxLength={PASSWORD_MAX}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              className={`rounded-md border bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 ${
                password && confirmPassword && password !== confirmPassword
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-rose-300 focus:border-rose-600'
              }`}
            />
          </label>
          {password && confirmPassword && password !== confirmPassword && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
              <svg className="h-4 w-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                  clipRule="evenodd"
                />
              </svg>
              Passwords do not match
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex flex-col gap-1 text-sm">
            Display name
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(normalizeDisplayNameInput(e.target.value))}
              placeholder="@alice"
              required
              className={`rounded-md border bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 ${
                displayNameAvailability === 'taken' || displayNameAvailability === 'invalid'
                  ? 'border-red-500 focus:border-red-600'
                  : displayNameAvailability === 'available'
                    ? 'border-green-500 focus:border-green-600'
                    : 'border-rose-300 focus:border-rose-600'
              }`}
            />
          </label>
          {displayNameAvailability === 'invalid' && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
              <svg className="h-4 w-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                  clipRule="evenodd"
                />
              </svg>
              Must start with @ followed by 3–29 letters, numbers or underscores
            </p>
          )}
          {displayNameAvailability === 'checking' && (
            <p className="flex items-center gap-1.5 text-xs text-rose-500">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
              Checking availability…
            </p>
          )}
          {displayNameAvailability === 'available' && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-green-700">
              <svg className="h-4 w-4 shrink-0 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.296a1 1 0 0 1 0 1.414l-7.5 7.5a1 1 0 0 1-1.414 0l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.086l6.79-6.79a1 1 0 0 1 1.414 0Z"
                  clipRule="evenodd"
                />
              </svg>
              Display name is available
            </p>
          )}
          {displayNameAvailability === 'taken' && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-red-700">
              <svg className="h-4 w-4 shrink-0 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                  clipRule="evenodd"
                />
              </svg>
              Display name is already taken
            </p>
          )}
          {displayNameAvailability === 'idle' && (
            <p className="text-xs text-rose-600">Must match ^@[a-zA-Z0-9_]{'{'}3,29{'}'}$</p>
          )}
        </div>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            (password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword)
          }
          className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Registering…' : 'Create account'}
        </button>
      </form>
    </>
  )
}
