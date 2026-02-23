type NoticeType = 'error' | 'success' | 'info'

export type Notice = {
  text: string
  type: NoticeType
}

type NoticeBannerProps = {
  notice: Notice | null
}

const noticeStyles: Record<NoticeType, string> = {
  error: 'border-rose-700 bg-rose-200 text-rose-800',
  success: 'border-green-700 bg-green-100 text-green-800',
  info: 'border-rose-500 bg-rose-200 text-rose-800',
}

export function NoticeBanner({ notice }: NoticeBannerProps) {
  if (!notice) {
    return null
  }

  return <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${noticeStyles[notice.type]}`}>{notice.text}</p>
}
