import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type NoticeType = 'error' | 'success' | 'info'

export type Notice = {
  text: string
  type: NoticeType
}

type NoticeBannerProps = {
  notice: Notice | null
  onDismiss?: () => void
}

const noticeStyles: Record<NoticeType, string> = {
  error: 'border-red-700 bg-red-600 text-white',
  success: 'border-green-700 bg-green-600 text-white',
  info: 'border-rose-600 bg-rose-600 text-white',
}

const TOAST_DURATION_MS = 4000

export function NoticeBanner({ notice, onDismiss }: NoticeBannerProps) {
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<Notice | null>(null)

  useEffect(() => {
    if (!notice) {
      setVisible(false)
      return
    }

    setCurrent(notice)
    setVisible(true)

    const timer = setTimeout(() => {
      setVisible(false)
      onDismiss?.()
    }, TOAST_DURATION_MS)

    return () => clearTimeout(timer)
  }, [notice])

  if (!visible || !current) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed right-4 top-4 z-50 flex min-w-65 max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${noticeStyles[current.type]}`}
    >
      <span className="flex-1 text-sm font-medium leading-snug">{current.text}</span>
      <button
        type="button"
        onClick={() => { setVisible(false); onDismiss?.() }}
        aria-label="Dismiss"
        className="mt-0.5 shrink-0 opacity-80 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
