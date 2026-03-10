import { type FormEvent } from 'react'
import { ADMIN_MAX_LIMIT, ADMIN_MIN_LIMIT } from '../constants'
import type { AdminSearchField, AdminUserMode, AdminViewMode } from '../types'

export type BooleanFilterValue = 'ALL' | 'true' | 'false'
export type ModeFilterValue = 'ALL' | AdminUserMode

type AdminControlsProps = {
  viewMode: AdminViewMode
  onViewModeChange: (nextMode: AdminViewMode) => void
  searchQuery: string
  searchField: AdminSearchField
  onSearchQueryChange: (query: string) => void
  onSearchFieldChange: (field: AdminSearchField) => void
  onApplySearch: () => void
  filterMode: ModeFilterValue
  filterAppearInSearches: BooleanFilterValue
  filterAppearInDiscoveryGame: BooleanFilterValue
  filterIsBlocked: BooleanFilterValue
  filterIsActivated: BooleanFilterValue
  onFilterModeChange: (value: ModeFilterValue) => void
  onFilterAppearInSearchesChange: (value: BooleanFilterValue) => void
  onFilterAppearInDiscoveryGameChange: (value: BooleanFilterValue) => void
  onFilterIsBlockedChange: (value: BooleanFilterValue) => void
  onFilterIsActivatedChange: (value: BooleanFilterValue) => void
  onApplyFilter: () => void
  onResetFilter: () => void
  page: number
  totalPages: number
  total: number
  limit: number
  onLimitChange: (limit: number) => void
  onPrevPage: () => void
  onNextPage: () => void
  onRefresh: () => void
  isLoading: boolean
}

const modeButtonClass = (active: boolean): string => {
  if (active) {
    return 'rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-sm font-medium text-rose-100'
  }

  return 'rounded-md border border-rose-500 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60'
}

const booleanFilterLabel = (value: BooleanFilterValue): string => {
  if (value === 'ALL') {
    return 'Any'
  }

  return value === 'true' ? 'Yes' : 'No'
}

export function AdminControls({
  viewMode,
  onViewModeChange,
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
  onApplySearch,
  filterMode,
  filterAppearInSearches,
  filterAppearInDiscoveryGame,
  filterIsBlocked,
  filterIsActivated,
  onFilterModeChange,
  onFilterAppearInSearchesChange,
  onFilterAppearInDiscoveryGameChange,
  onFilterIsBlockedChange,
  onFilterIsActivatedChange,
  onApplyFilter,
  onResetFilter,
  page,
  totalPages,
  total,
  limit,
  onLimitChange,
  onPrevPage,
  onNextPage,
  onRefresh,
  isLoading,
}: AdminControlsProps) {
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApplySearch()
  }

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onApplyFilter()
  }

  return (
    <section className="rounded-xl border border-rose-300 bg-rose-100 p-4 shadow-sm shadow-rose-300/30">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={modeButtonClass(viewMode === 'list')} onClick={() => onViewModeChange('list')}>
          List
        </button>
        <button type="button" className={modeButtonClass(viewMode === 'filter')} onClick={() => onViewModeChange('filter')}>
          Filter
        </button>
        <button type="button" className={modeButtonClass(viewMode === 'search')} onClick={() => onViewModeChange('search')}>
          Search
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="ml-auto rounded-md border border-rose-700 bg-rose-700 px-3 py-1 text-sm font-medium text-rose-100 hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {viewMode === 'search' && (
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleSearchSubmit}>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            Query
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search users"
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none placeholder:text-rose-500 focus:border-rose-600"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Search Field
            <select
              value={searchField}
              onChange={(event) => onSearchFieldChange(event.target.value as AdminSearchField)}
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
            >
              <option value="displayName">Display Name</option>
              <option value="email">Email</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
            >
              Search
            </button>
          </div>
        </form>
      )}

      {viewMode === 'filter' && (
        <form className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6" onSubmit={handleFilterSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            Mode
            <select
              value={filterMode}
              onChange={(event) => onFilterModeChange(event.target.value as ModeFilterValue)}
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
            >
              <option value="ALL">Any</option>
              <option value="PUBLIC">PUBLIC</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            In Searches
            <select
              value={filterAppearInSearches}
              onChange={(event) => onFilterAppearInSearchesChange(event.target.value as BooleanFilterValue)}
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
            >
              <option value="ALL">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            In Discovery
            <select
              value={filterAppearInDiscoveryGame}
              onChange={(event) => onFilterAppearInDiscoveryGameChange(event.target.value as BooleanFilterValue)}
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
            >
              <option value="ALL">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Blocked
            <select
              value={filterIsBlocked}
              onChange={(event) => onFilterIsBlockedChange(event.target.value as BooleanFilterValue)}
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
            >
              <option value="ALL">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Activated
            <select
              value={filterIsActivated}
              onChange={(event) => onFilterIsActivatedChange(event.target.value as BooleanFilterValue)}
              className="rounded-md border border-rose-300 bg-rose-100 px-3 py-2 outline-none focus:border-rose-600"
            >
              <option value="ALL">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full rounded-md border border-rose-700 bg-rose-700 px-3 py-2 text-sm font-medium text-rose-100 hover:bg-rose-800"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onResetFilter}
              className="w-full rounded-md border border-rose-600 bg-transparent px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-200/60"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {viewMode === 'filter' && (
        <p className="mt-2 text-xs text-rose-700">
          Current filters: mode {filterMode}, search visibility {booleanFilterLabel(filterAppearInSearches)}, discovery {booleanFilterLabel(filterAppearInDiscoveryGame)}, blocked {booleanFilterLabel(filterIsBlocked)}, activated {booleanFilterLabel(filterIsActivated)}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-rose-300 pt-4">
        <label className="flex items-center gap-2 text-sm text-rose-800">
          Per Page
          <input
            type="number"
            min={ADMIN_MIN_LIMIT}
            max={ADMIN_MAX_LIMIT}
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="w-24 rounded-md border border-rose-300 bg-rose-100 px-2 py-1 outline-none focus:border-rose-600"
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={page <= 1 || isLoading}
            className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Previous
          </button>
          <span className="text-sm text-rose-800">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={page >= totalPages || isLoading}
            className="rounded-md border border-rose-600 bg-transparent px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-200/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>

        <span className="ml-auto text-sm text-rose-800">Total users: {total}</span>
      </div>
    </section>
  )
}
