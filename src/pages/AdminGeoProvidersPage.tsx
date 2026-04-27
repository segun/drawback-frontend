import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { AdminGeoProvidersTable } from '../modules/admin/components/AdminGeoProvidersTable'
import { useAdminSessionGuard } from '../modules/admin/hooks/useAdminSessionGuard'
import type { GeoProvider, CreateGeoProviderPayload, UpdateGeoProviderPayload } from '../modules/admin/types'

type FormState = {
  name: string
  urlTemplate: string
  apiKey: string
  responseMapping: string
  attributionText: string
  sortOrder: string
  isEnabled: boolean
}

const DEFAULT_FORM: FormState = {
  name: '',
  urlTemplate: '',
  apiKey: '',
  responseMapping: JSON.stringify({ country: '', region: '' }, null, 2),
  attributionText: '',
  sortOrder: '0',
  isEnabled: true,
}

const providerToForm = (provider: GeoProvider): FormState => ({
  name: provider.name,
  urlTemplate: provider.urlTemplate,
  apiKey: '',
  responseMapping: JSON.stringify(provider.responseMapping, null, 2),
  attributionText: provider.attributionText ?? '',
  sortOrder: String(provider.sortOrder),
  isEnabled: provider.isEnabled,
})

const parseResponseMapping = (raw: string): Record<string, string> | null => {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }
    const obj = parsed as Record<string, unknown>
    if (typeof obj.country !== 'string' || typeof obj.region !== 'string') {
      return null
    }
    return obj as Record<string, string>
  } catch {
    return null
  }
}

export function AdminGeoProvidersPage() {
  const navigate = useNavigate()
  const { adminApi, handleUnauthorizedError, isAuthorized, logout } = useAdminSessionGuard()

  const [notice, setNotice] = useState<Notice | null>(null)
  const [providers, setProviders] = useState<GeoProvider[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  const loadProviders = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminApi.listGeoProviders()
      setProviders(data.data ?? [])
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) return
      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [adminApi, handleUnauthorizedError])

  useEffect(() => {
    if (!isAuthorized) return
    void loadProviders()
  }, [isAuthorized, loadProviders])

  const handleFieldChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = event.target.type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const openCreateForm = () => {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setShowForm(true)
  }

  const openEditForm = (provider: GeoProvider) => {
    setEditingId(provider.id)
    setForm(providerToForm(provider))
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(DEFAULT_FORM)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const responseMapping = parseResponseMapping(form.responseMapping)
    if (!responseMapping) {
      setNotice({
        text: 'Response mapping must be valid JSON with "country" and "region" string keys.',
        type: 'error',
      })
      return
    }

    const sortOrder = parseInt(form.sortOrder, 10)
    if (!Number.isInteger(sortOrder)) {
      setNotice({ text: 'Sort order must be an integer.', type: 'error' })
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        const payload: UpdateGeoProviderPayload = {
          name: form.name || undefined,
          urlTemplate: form.urlTemplate || undefined,
          responseMapping,
          attributionText: form.attributionText || null,
          sortOrder,
          isEnabled: form.isEnabled,
        }
        if (form.apiKey) {
          payload.apiKey = form.apiKey
        }
        const updated = await adminApi.updateGeoProvider(editingId, payload)
        setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setNotice({ text: 'Geo provider updated.', type: 'success' })
      } else {
        const payload: CreateGeoProviderPayload = {
          name: form.name,
          urlTemplate: form.urlTemplate,
          responseMapping,
          attributionText: form.attributionText || null,
          sortOrder,
          isEnabled: form.isEnabled,
        }
        if (form.apiKey) {
          payload.apiKey = form.apiKey
        }
        const created = await adminApi.createGeoProvider(payload)
        setProviders((prev) => [...prev, created])
        setNotice({ text: 'Geo provider created.', type: 'success' })
      }
      cancelForm()
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) return
      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const provider = providers.find((p) => p.id === id)
    if (!window.confirm(`Delete geo provider "${provider?.name ?? id}"? This cannot be undone.`)) return

    try {
      await adminApi.deleteGeoProvider(id)
      setProviders((prev) => prev.filter((p) => p.id !== id))
      setNotice({ text: 'Geo provider deleted.', type: 'success' })
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) return
      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 pb-12 pt-24">
        <div className="container mx-auto max-w-5xl px-6">
          {notice && <NoticeBanner notice={notice} onDismiss={() => setNotice(null)} />}

          <section className="mb-4 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-rose-900">Geo Providers</h1>
              <p className="text-sm text-rose-700">Manage IP geo-lookup provider configurations.</p>
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
            {/* Providers List */}
            <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-rose-900">Providers</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void loadProviders()}
                    disabled={isLoading}
                    className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  {!showForm && (
                    <button
                      type="button"
                      onClick={openCreateForm}
                      className="rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-sm font-medium text-rose-100 hover:bg-rose-800"
                    >
                      + New Provider
                    </button>
                  )}
                </div>
              </div>
              <AdminGeoProvidersTable
                providers={providers}
                onEdit={openEditForm}
                onDelete={(id) => void handleDelete(id)}
                isLoading={isLoading}
              />
            </section>

            {/* Create / Edit Form */}
            {showForm && (
              <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
                <h2 className="mb-4 text-base font-semibold text-rose-900">
                  {editingId ? 'Edit Geo Provider' : 'New Geo Provider'}
                </h2>
                <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Name <span className="text-red-600">*</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleFieldChange('name')}
                      required
                      maxLength={100}
                      placeholder="e.g. freeipapi"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Sort Order
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={handleFieldChange('sortOrder')}
                      step={1}
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="col-span-full flex flex-col gap-1 text-sm text-rose-900">
                    URL Template <span className="text-red-600">*</span>
                    <input
                      type="text"
                      value={form.urlTemplate}
                      onChange={handleFieldChange('urlTemplate')}
                      required
                      maxLength={500}
                      placeholder="https://example.com/api/{ip}"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 font-mono text-xs outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="col-span-full flex flex-col gap-1 text-sm text-rose-900">
                    API Key
                    <input
                      type="password"
                      value={form.apiKey}
                      onChange={handleFieldChange('apiKey')}
                      autoComplete="new-password"
                      placeholder={editingId ? 'Leave blank to keep existing key' : 'Optional'}
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="col-span-full flex flex-col gap-1 text-sm text-rose-900">
                    Response Mapping (JSON) <span className="text-red-600">*</span>
                    <span className="text-xs text-rose-600">
                      Must include &quot;country&quot; and &quot;region&quot; keys mapping to the provider&apos;s response field names.
                    </span>
                    <textarea
                      value={form.responseMapping}
                      onChange={handleFieldChange('responseMapping')}
                      required
                      rows={4}
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 font-mono text-xs outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="col-span-full flex flex-col gap-1 text-sm text-rose-900">
                    Attribution Text
                    <input
                      type="text"
                      value={form.attributionText}
                      onChange={handleFieldChange('attributionText')}
                      placeholder="Optional — required by some providers"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="col-span-full flex items-center gap-2 text-sm text-rose-900">
                    <input
                      type="checkbox"
                      checked={form.isEnabled}
                      onChange={handleFieldChange('isEnabled')}
                      className="accent-rose-600"
                    />
                    Enabled
                  </label>

                  <div className="col-span-full flex gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Provider'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelForm}
                      disabled={isSaving}
                      className="rounded-md border border-rose-600 bg-transparent px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
