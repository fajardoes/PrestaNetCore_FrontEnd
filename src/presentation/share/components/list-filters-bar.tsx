import type { ReactNode } from 'react'

export type StatusFilterValue = 'all' | 'active' | 'inactive'

interface ListFiltersBarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  searchLabel?: string
  status: StatusFilterValue
  onStatusChange: (value: StatusFilterValue) => void
  showStatus?: boolean
  layout?: 'single-row' | 'two-rows'
  children?: ReactNode
  actions?: ReactNode
}

export const ListFiltersBar = ({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  searchLabel,
  status,
  onStatusChange,
  showStatus = true,
  layout = 'single-row',
  children,
  actions,
}: ListFiltersBarProps) => {
  const searchControl = (
    <div className="flex min-w-0 flex-col gap-1.5">
      {searchLabel ? (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {searchLabel}
        </label>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <input
          type="search"
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 md:w-72"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {showStatus ? <StatusPills value={status} onChange={onStatusChange} /> : null}
      </div>
    </div>
  )

  if (layout === 'two-rows') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">{searchControl}</div>
          {actions ? (
            <div className="flex items-center gap-2 self-start lg:self-auto">{actions}</div>
          ) : null}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        {searchControl}
        {children}
      </div>
      {actions ? (
        <div className="flex flex-col gap-2 self-start md:flex-row md:items-center md:gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

interface StatusPillsProps {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
}

const statusOptions: { label: string; value: StatusFilterValue }[] = [
  { label: 'Activos', value: 'active' },
  { label: 'Inactivos', value: 'inactive' },
  { label: 'Todos', value: 'all' },
]

const StatusPills = ({ value, onChange }: StatusPillsProps) => {
  return (
    <div className="inline-flex w-full items-center justify-start gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900 sm:w-auto">
      {statusOptions.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40 sm:flex-none ${
              isActive
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
