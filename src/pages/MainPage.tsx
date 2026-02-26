import { Link } from 'wouter'
import { Header } from '../components/common/Header'

export function MainPage() {
  return (
    <div className="min-h-dvh bg-rose-50 text-rose-800">
      <Header isLoggedIn={false} />
      <main className="mx-auto max-w-xl px-4 pb-8">
        <div className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
          <h1 className="mb-4 text-2xl font-bold text-rose-700">Welcome to DrawkcaB</h1>
          
          <p className="mb-4 text-sm text-rose-700">
            A real-time collaborative drawing chat app. Register, confirm your email, and start
            drawing with friends!
          </p>

          <div className="mb-6 flex gap-3">
            <Link
              href="/register"
              className="flex-1 rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-center font-medium text-rose-100 hover:bg-rose-800"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="flex-1 rounded-md border border-rose-300 bg-rose-100 px-4 py-2 text-center font-medium text-rose-700 hover:bg-rose-200"
            >
              Login
            </Link>
          </div>

          {/* <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-rose-700">How it works</p>
            <video
              src="/videos/how.mov"
              controls
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded-md border border-rose-300"
            />
          </div> */}

          <div className="mt-6 text-center">
            <Link
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-rose-600 underline hover:text-rose-800"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
