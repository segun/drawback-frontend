import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { useAdminSessionGuard } from '../modules/admin/hooks/useAdminSessionGuard'
import type { AdminAppConfig, AdminAppConfigProvider } from '../modules/admin/types'

const DEFAULT_PROVIDER: AdminAppConfigProvider = 'admob'
const DEFAULT_TEMP_DISCOVERY_ACCESS_DURATION_MINUTES = 1

export function AdminAppConfigPage() {
  const navigate = useNavigate()
  const { adminApi, handleUnauthorizedError, isAuthorized, logout } = useAdminSessionGuard()

  const [notice, setNotice] = useState<Notice | null>(null)

  const [globalConfig, setGlobalConfig] = useState<AdminAppConfig | null>(null)
  const [globalProvider, setGlobalProvider] = useState<AdminAppConfigProvider>(DEFAULT_PROVIDER)
  const [globalTemporaryDiscoveryAccessDurationMinutes, setGlobalTemporaryDiscoveryAccessDurationMinutes] = useState(
    DEFAULT_TEMP_DISCOVERY_ACCESS_DURATION_MINUTES,
  )
  const [globalLoadError, setGlobalLoadError] = useState<string | null>(null)
  const [isLoadingGlobalConfig, setIsLoadingGlobalConfig] = useState(false)
  const [isSavingGlobalConfig, setIsSavingGlobalConfig] = useState(false)

  const loadGlobalConfig = useCallback(async () => {
    setIsLoadingGlobalConfig(true)
    setGlobalLoadError(null)

    try {
      const response = await adminApi.getGlobalAppConfig()
      setGlobalConfig(response)
      setGlobalProvider(response.ads.provider)
      setGlobalTemporaryDiscoveryAccessDurationMinutes(response.temporaryDiscoveryAccessDurationMinutes)
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setGlobalLoadError(message)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoadingGlobalConfig(false)
    }
  }, [adminApi, handleUnauthorizedError])

  useEffect(() => {
    if (!isAuthorized) {
      return
    }

    void loadGlobalConfig()
  }, [isAuthorized, loadGlobalConfig])

  const handleSaveGlobalConfig = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!Number.isInteger(globalTemporaryDiscoveryAccessDurationMinutes) || globalTemporaryDiscoveryAccessDurationMinutes < 1) {
      setNotice({ text: 'Temporary discovery access duration must be an integer of at least 1 minute.', type: 'error' })
      return
    }

    setIsSavingGlobalConfig(true)
    try {
      const response = await adminApi.updateGlobalAppConfig({
        ads: {
          provider: globalProvider,
        },
        temporaryDiscoveryAccessDurationMinutes: globalTemporaryDiscoveryAccessDurationMinutes,
      })

      setGlobalConfig(response)
      setGlobalProvider(response.ads.provider)
      setGlobalTemporaryDiscoveryAccessDurationMinutes(response.temporaryDiscoveryAccessDurationMinutes)
      setNotice({ text: 'Updated global app config.', type: 'success' })
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) {
        return
      }

      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsSavingGlobalConfig(false)
    }
  }

  const globalProviderValue = globalConfig?.ads.provider ?? '-'
  const globalTemporaryDiscoveryAccessDurationMinutesValue = globalConfig?.temporaryDiscoveryAccessDurationMinutes ?? '-'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-12 pt-24">
        <div className="container mx-auto max-w-5xl px-6">
          {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}

          <section className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-rose-900">Admin App Config</h1>
              <p className="text-sm text-rose-700">Manage global app config values.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="ml-auto rounded-md border border-rose-600 bg-transparent px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
            >
              Log Out
            </button>
          </section>

          <div className="grid gap-4">
            <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-rose-900">Global App Config</h2>
                  <p className="mt-1 text-sm text-rose-700">Uses GET and PATCH /admin/app-config.</p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadGlobalConfig()}
                  disabled={isLoadingGlobalConfig || isSavingGlobalConfig}
                  className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingGlobalConfig ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {globalLoadError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {globalLoadError}
                </div>
              )}

              <form className="mt-4 flex flex-col gap-3" onSubmit={handleSaveGlobalConfig}>
                <label className="flex flex-col gap-1 text-sm text-rose-900">
                  Ads Provider
                  <input
                    type="text"
                    value={globalProvider}
                    onChange={(event) => setGlobalProvider(event.target.value as AdminAppConfigProvider)}
                    placeholder="admob"
                    className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-rose-900">
                  Temporary Discovery Access Duration (minutes)
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={globalTemporaryDiscoveryAccessDurationMinutes}
                    onChange={(event) => setGlobalTemporaryDiscoveryAccessDurationMinutes(Number(event.target.value))}
                    className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoadingGlobalConfig || isSavingGlobalConfig}
                  className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingGlobalConfig ? 'Saving...' : 'Save Global Config'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}