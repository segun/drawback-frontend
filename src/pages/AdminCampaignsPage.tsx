import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/landing/Footer'
import Navbar from '../components/landing/Navbar'
import { NoticeBanner, type Notice } from '../common/components/NoticeBanner'
import { mapErrorToMessage } from '../common/utils/errorMapper'
import { AdminCampaignsTable } from '../modules/admin/components/AdminCampaignsTable'
import { useAdminSessionGuard } from '../modules/admin/hooks/useAdminSessionGuard'
import { ADMIN_DEFAULT_LIMIT, ADMIN_DEFAULT_PAGE } from '../modules/admin/constants'
import type {
  Campaign,
  CampaignDisplayType,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '../modules/admin/types'

type FormState = {
  link: string
  header: string
  footer: string
  displayType: CampaignDisplayType
  countdown: string
  country: string
  region: string
  startAt: string
  endAt: string
  isActive: boolean
}

const DEFAULT_FORM: FormState = {
  link: '',
  header: '',
  footer: '',
  displayType: 'closeable',
  countdown: '10',
  country: '',
  region: '',
  startAt: '',
  endAt: '',
  isActive: true,
}

// Convert ISO string to datetime-local value (YYYY-MM-DDTHH:mm)
const isoToDatetimeLocal = (iso: string): string => {
  try {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

const campaignToForm = (campaign: Campaign): FormState => ({
  link: campaign.link,
  header: campaign.header ?? '',
  footer: campaign.footer ?? '',
  displayType: campaign.displayType,
  countdown: campaign.countdown != null ? String(campaign.countdown) : '10',
  country: campaign.country ?? '',
  region: campaign.region ?? '',
  startAt: isoToDatetimeLocal(campaign.startAt),
  endAt: isoToDatetimeLocal(campaign.endAt),
  isActive: campaign.isActive,
})

export function AdminCampaignsPage() {
  const navigate = useNavigate()
  const { adminApi, handleUnauthorizedError, isAuthorized, logout } = useAdminSessionGuard()

  const [notice, setNotice] = useState<Notice | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(ADMIN_DEFAULT_PAGE)
  const limit = ADMIN_DEFAULT_LIMIT
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const loadCampaigns = useCallback(async (targetPage: number) => {
    setIsLoading(true)
    try {
      const data = await adminApi.listCampaigns({ page: targetPage, limit })
      setCampaigns(data.data ?? [])
      setTotal(data.total ?? 0)
    } catch (error: unknown) {
      if (handleUnauthorizedError(error)) return
      const message = mapErrorToMessage(error)
      setNotice({ text: message, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [adminApi, handleUnauthorizedError, limit])

  useEffect(() => {
    if (!isAuthorized) return
    void loadCampaigns(page)
  }, [isAuthorized, loadCampaigns, page])

  const handleFieldChange = (field: keyof FormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
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

  const openEditForm = (campaign: Campaign) => {
    setEditingId(campaign.id)
    setForm(campaignToForm(campaign))
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(DEFAULT_FORM)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.startAt || !form.endAt) {
      setNotice({ text: 'Start date and end date are required.', type: 'error' })
      return
    }

    const startAt = new Date(form.startAt).toISOString()
    const endAt = new Date(form.endAt).toISOString()

    if (new Date(endAt) <= new Date(startAt)) {
      setNotice({ text: 'End date must be after start date.', type: 'error' })
      return
    }

    if (form.displayType === 'timed') {
      const countdown = parseInt(form.countdown, 10)
      if (!Number.isInteger(countdown) || countdown < 1) {
        setNotice({ text: 'Countdown must be at least 1 second for timed campaigns.', type: 'error' })
        return
      }
    }

    setIsSaving(true)
    try {
      if (editingId) {
        const payload: UpdateCampaignPayload = {
          link: form.link || undefined,
          header: form.header || null,
          footer: form.footer || null,
          displayType: form.displayType,
          countdown: form.displayType === 'timed' ? parseInt(form.countdown, 10) : null,
          country: form.country || null,
          region: form.region || null,
          startAt,
          endAt,
          isActive: form.isActive,
        }
        const updated = await adminApi.updateCampaign(editingId, payload)
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
        setNotice({ text: 'Campaign updated.', type: 'success' })
      } else {
        const payload: CreateCampaignPayload = {
          link: form.link,
          header: form.header || null,
          footer: form.footer || null,
          displayType: form.displayType,
          countdown: form.displayType === 'timed' ? parseInt(form.countdown, 10) : null,
          country: form.country || null,
          region: form.region || null,
          startAt,
          endAt,
          isActive: form.isActive,
        }
        const created = await adminApi.createCampaign(payload)
        setCampaigns((prev) => [created, ...prev])
        setTotal((prev) => prev + 1)
        setNotice({ text: 'Campaign created.', type: 'success' })
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
    const campaign = campaigns.find((c) => c.id === id)
    const label = campaign?.header ?? campaign?.link ?? id
    if (!window.confirm(`Delete campaign "${label}"? This cannot be undone.`)) return

    try {
      await adminApi.deleteCampaign(id)
      const newTotal = total - 1
      const newTotalPages = Math.max(1, Math.ceil(newTotal / limit))
      const targetPage = page > newTotalPages ? newTotalPages : page
      setTotal(newTotal)
      setPage(targetPage)
      void loadCampaigns(targetPage)
      setNotice({ text: 'Campaign deleted.', type: 'success' })
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
              <h1 className="text-2xl font-semibold text-rose-900">Campaigns</h1>
              <p className="text-sm text-rose-700">Manage promotional campaigns shown to users.</p>
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
            {/* Campaigns List */}
            <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-rose-900">
                  All Campaigns
                  {total > 0 && (
                    <span className="ml-2 text-sm font-normal text-rose-600">({total} total)</span>
                  )}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void loadCampaigns(page)}
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
                      + New Campaign
                    </button>
                  )}
                </div>
              </div>
              <AdminCampaignsTable
                campaigns={campaigns}
                onEdit={openEditForm}
                onDelete={(id) => void handleDelete(id)}
                onViewDeliveries={(campaign) =>
                  navigate(
                    `/admin/campaign-deliveries?campaignId=${campaign.id}${campaign.header ? `&campaignHeader=${encodeURIComponent(campaign.header)}` : ''}`,
                  )
                }
                isLoading={isLoading}
                page={page}
                totalPages={totalPages}
                total={total}
                onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
                onNextPage={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </section>

            {/* Create / Edit Form */}
            {showForm && (
              <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
                <h2 className="mb-4 text-base font-semibold text-rose-900">
                  {editingId ? 'Edit Campaign' : 'New Campaign'}
                </h2>
                <form className="grid gap-3 md:grid-cols-2" onSubmit={(e) => void handleSubmit(e)}>
                  <label className="col-span-full flex flex-col gap-1 text-sm text-rose-900">
                    <span>Link <span className="text-red-600">*</span></span>
                    <input
                      type="url"
                      value={form.link}
                      onChange={handleFieldChange('link')}
                      required
                      maxLength={2048}
                      placeholder="https://example.com/promo"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Header
                    <input
                      type="text"
                      value={form.header}
                      onChange={handleFieldChange('header')}
                      maxLength={500}
                      placeholder="🎉 Special offer"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Footer
                    <input
                      type="text"
                      value={form.footer}
                      onChange={handleFieldChange('footer')}
                      maxLength={500}
                      placeholder="Limited time only"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Display Type
                    <select
                      value={form.displayType}
                      onChange={handleFieldChange('displayType')}
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    >
                      <option value="closeable">Closeable</option>
                      <option value="timed">Timed</option>
                    </select>
                  </label>

                  {form.displayType === 'timed' && (
                    <label className="flex flex-col gap-1 text-sm text-rose-900">
                      <span>Countdown (seconds) <span className="text-red-600">*</span></span>
                      <input
                        type="number"
                        value={form.countdown}
                        onChange={handleFieldChange('countdown')}
                        required
                        min={1}
                        step={1}
                        className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                      />
                    </label>
                  )}

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Country
                    <input
                      type="text"
                      value={form.country}
                      onChange={handleFieldChange('country')}
                      placeholder="e.g. United States (leave blank for all)"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    Region
                    <input
                      type="text"
                      value={form.region}
                      onChange={handleFieldChange('region')}
                      placeholder="e.g. California (leave blank for all)"
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    <span>Start Date &amp; Time <span className="text-red-600">*</span></span>
                    <input
                      type="datetime-local"
                      value={form.startAt}
                      onChange={handleFieldChange('startAt')}
                      required
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm text-rose-900">
                    <span>End Date &amp; Time <span className="text-red-600">*</span></span>
                    <input
                      type="datetime-local"
                      value={form.endAt}
                      onChange={handleFieldChange('endAt')}
                      required
                      className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 outline-none focus:border-rose-600"
                    />
                  </label>

                  <label className="col-span-full flex items-center gap-2 text-sm text-rose-900">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={handleFieldChange('isActive')}
                      className="accent-rose-600"
                    />
                    Active
                  </label>

                  <div className="col-span-full flex gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-md border border-rose-700 bg-rose-700 px-4 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Campaign'}
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
