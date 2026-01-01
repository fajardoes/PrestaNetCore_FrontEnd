import type { ReactNode } from 'react'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { JournalFiltersState, JournalSourceFilter, JournalStateFilter } from '@/presentation/features/accounting/journal/hooks/use-journal-list'

interface JournalFiltersBarProps {
  filters: JournalFiltersState
  onFiltersChange: (next: Partial<JournalFiltersState>) => void
  actions?: ReactNode
  onReset?: () => void
}

export const JournalFiltersBar = ({
  filters,
  onFiltersChange,
  actions,
  onReset,
}: JournalFiltersBarProps) => {
  return (
    <ListFiltersBar
      search={filters.search}
      onSearchChange={(value) => onFiltersChange({ search: value })}
      placeholder="Buscar por número o descripción..."
      status="all"
      onStatusChange={() => {
        /* status pills ocultos */
      }}
      showStatus={false}
      children={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Desde
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(event) =>
                onFiltersChange({ fromDate: event.target.value })
              }
              className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hasta
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(event) =>
                onFiltersChange({ toDate: event.target.value })
              }
              className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado
            </label>
            <select
              value={filters.state}
              onChange={(event) =>
                onFiltersChange({ state: event.target.value as JournalStateFilter })
              }
              className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            >
              <option value="all">Todos</option>
              <option value="draft">Borrador</option>
              <option value="posted">Contabilizado</option>
              <option value="voided">Anulado</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fuente
            </label>
            <select
              value={filters.source}
              onChange={(event) =>
                onFiltersChange({ source: event.target.value as JournalSourceFilter })
              }
              className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            >
              <option value="all">Todas</option>
              <option value="manual">Manual</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Período
            </label>
            <select
              value={filters.periodId}
              onChange={(event) =>
                onFiltersChange({ periodId: event.target.value })
              }
              className="w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              disabled
            >
              <option value="">TODO: cargar períodos</option>
            </select>
          </div>
          {onReset ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      }
      actions={actions}
    />
  )
}
