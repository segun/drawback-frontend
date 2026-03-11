import { useState } from 'react'
import type { AdminReport, AdminReportStatus } from '../types'

type AdminReportsTableProps = {
  reports: AdminReport[]
  isLoading: boolean
  loadError: string | null
  onChangeStatus: (report: AdminReport, status: AdminReportStatus) => void
  onDeleteReport: (report: AdminReport) => void
}

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

const truncateText = (value: string | null, maxLength: number): string => {
  if (!value) {
    return '-'
  }

  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength - 3)}...`
}

const renderMaybeText = (value: string | null): string => {
  return value && value.trim() ? value : '-'
}

const rowStatusClass = (status: AdminReportStatus): string => {
  if (status === 'PENDING') {
    return 'bg-amber-100 text-amber-900 border-amber-300'
  }

  if (status === 'UNDER_REVIEW') {
    return 'bg-blue-100 text-blue-900 border-blue-300'
  }

  if (status === 'RESOLVED') {
    return 'bg-green-100 text-green-900 border-green-300'
  }

  return 'bg-slate-100 text-slate-800 border-slate-300'
}

export function AdminReportsTable({
  reports,
  isLoading,
  loadError,
  onChangeStatus,
  onDeleteReport,
}: AdminReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(null)

  const closeDialog = () => {
    setSelectedReport(null)
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-rose-300 bg-rose-100 shadow-sm shadow-rose-300/30">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-rose-300 text-rose-800">
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Reported User</th>
              <th className="px-3 py-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-5 text-center text-rose-700">
                  Loading reports...
                </td>
              </tr>
            )}

            {!isLoading && loadError && (
              <tr>
                <td colSpan={5} className="px-3 py-5 text-center text-red-700">
                  {loadError}
                </td>
              </tr>
            )}

            {!isLoading && !loadError && reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-5 text-center text-rose-700">
                  No reports found.
                </td>
              </tr>
            )}

            {!isLoading && !loadError && reports.map((report) => (
              <tr
                key={report.id}
                className="cursor-pointer border-b border-rose-200/70 align-top hover:bg-rose-200/40"
                onClick={() => setSelectedReport(report)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setSelectedReport(report)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open details for report ${report.id}`}
              >
                <td className="px-3 py-2 text-rose-900">{formatDateTime(report.createdAt)}</td>
                <td className="px-3 py-2 text-rose-900">{report.reportType}</td>
                <td className="px-3 py-2 text-rose-900">
                  <span className={`inline-flex rounded border px-2 py-0.5 text-xs font-semibold ${rowStatusClass(report.status)}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-rose-900">
                  <div className="font-medium">{report.reportedUser.displayName}</div>
                  <div className="text-xs">{report.reportedUser.email}</div>
                </td>
                <td className="px-3 py-2 text-rose-900" title={report.description}>
                  {truncateText(report.description, 100)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={closeDialog}
          role="dialog"
          aria-modal="true"
          aria-label="Report details dialog"
        >
          <div
            className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-rose-300 bg-rose-50 p-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-rose-900">Report Details</h3>
                <p className="text-xs text-rose-700">ID: {selectedReport.id}</p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 text-sm text-rose-900 md:grid-cols-2">
              <div><strong>Created:</strong> {formatDateTime(selectedReport.createdAt)}</div>
              <div><strong>Updated:</strong> {formatDateTime(selectedReport.updatedAt)}</div>
              <div><strong>Type:</strong> {selectedReport.reportType}</div>
              <div><strong>Status:</strong> {selectedReport.status}</div>
              <div><strong>Resolved At:</strong> {formatDateTime(selectedReport.resolvedAt)}</div>
              <div><strong>Resolved By:</strong> {renderMaybeText(selectedReport.resolvedBy)}</div>
            </div>

            <div className="mt-4 grid gap-3 rounded-lg border border-rose-200 bg-rose-100 p-3 text-sm text-rose-900 md:grid-cols-2">
              <div>
                <div className="font-semibold text-rose-900">Reporter</div>
                <div>{selectedReport.reporter.displayName}</div>
                <div className="text-xs">{selectedReport.reporter.email}</div>
                <div className="mt-1 font-mono text-xs">{selectedReport.reporter.id}</div>
              </div>
              <div>
                <div className="font-semibold text-rose-900">Reported User</div>
                <div>{selectedReport.reportedUser.displayName}</div>
                <div className="text-xs">{selectedReport.reportedUser.email}</div>
                <div className="mt-1 font-mono text-xs">{selectedReport.reportedUser.id}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-rose-900">
              <div>
                <div className="mb-1 font-semibold">Description</div>
                <div className="whitespace-pre-wrap rounded-md border border-rose-200 bg-rose-100 p-2">
                  {renderMaybeText(selectedReport.description)}
                </div>
              </div>

              <div>
                <div className="mb-1 font-semibold">Admin Notes</div>
                <div className="whitespace-pre-wrap rounded-md border border-rose-200 bg-rose-100 p-2">
                  {renderMaybeText(selectedReport.adminNotes)}
                </div>
              </div>

              <div>
                <div className="mb-1 font-semibold">Session Context</div>
                <div className="whitespace-pre-wrap rounded-md border border-rose-200 bg-rose-100 p-2">
                  {renderMaybeText(selectedReport.sessionContext)}
                </div>
              </div>

              <div>
                <div className="mb-1 font-semibold">Chat Request ID</div>
                <div className="rounded-md border border-rose-200 bg-rose-100 p-2 font-mono text-xs">
                  {renderMaybeText(selectedReport.chatRequestId)}
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-rose-200 pt-3">
              <div className="mb-2 text-sm font-semibold text-rose-900">Moderation Actions</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onChangeStatus(selectedReport, 'PENDING')}
                  className="rounded border border-rose-600 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-200/60"
                >
                  Set PENDING
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(selectedReport, 'UNDER_REVIEW')}
                  className="rounded border border-amber-700 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
                >
                  Set UNDER_REVIEW
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(selectedReport, 'RESOLVED')}
                  className="rounded border border-green-700 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100"
                >
                  Set RESOLVED
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStatus(selectedReport, 'DISMISSED')}
                  className="rounded border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Set DISMISSED
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteReport(selectedReport)}
                  className="rounded border border-red-700 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
