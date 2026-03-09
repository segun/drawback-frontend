import { useState, useEffect } from 'react'
import { Header } from '../components/common/Header'
import { useSearchParams } from "react-router-dom"

export function ConfirmPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'success' | 'error' | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const query = new URLSearchParams(searchParams)
    const statusParam = query.get('status')
    const reason = query.get('reason')?.trim()

    if (statusParam === 'success') {
      setStatus('success')
      setMessage('Email confirmed successfully. Proceed to the app to login.')
    } else if (statusParam === 'error') {
      setStatus('error')
      setMessage(reason || 'Invalid or expired activation token.')
    } else {
      setStatus('error')
      setMessage('No confirmation status provided.')
    }
  }, [searchParams])

  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-xl px-4 pb-8">
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          {status === 'success' && (
            <div className="rounded-md border border-green-300 bg-green-100 p-4">
              <h2 className="mb-2 text-lg font-semibold text-green-700">
                Email Confirmed
              </h2>
              <p className="text-sm text-green-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-md border border-red-300 bg-red-100 p-4">
              <h2 className="mb-2 text-lg font-semibold text-red-700">
                Confirmation Failed
              </h2>
              <p className="text-sm text-red-600">{message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
