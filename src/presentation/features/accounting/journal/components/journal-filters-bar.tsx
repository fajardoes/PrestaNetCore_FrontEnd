import type { ReactNode } from 'react'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { JournalFiltersState, JournalSourceFilter, JournalStateFilter } from '@/presentation/features/accounting/journal/hooks/use-journal-list'
import AsyncSelect from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'

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
  const stateOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'draft', label: 'Borrador' },
    { value: 'posted', label: 'Contabilizado' },
    { value: 'voided', label: 'Anulado' },
  ]
  const sourceOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'manual', label: 'Manual' },
    { value: 'system', label: 'Sistema' },
  ]
  const periodOptions = [{ value: '', label: 'TODO: cargar períodos' }]
  const filterOptions = async (
    options: Array<{ value: string; label: string }>,
    inputValue: string,
  ) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }

  return (
    <ListFiltersBar
      search={filters.search}
      onSearchChange={(value) => onFiltersChange({ search: value })}
      searchLabel="Buscar"
      placeholder="Buscar por número o descripción..."
      status="all"
      onStatusChange={() => {
        /* status pills ocultos */
      }}
      showStatus={false}
      layout="two-rows"
      children={
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Desde
            </label>
            <DatePicker
              value={filters.fromDate}
              onChange={(value) => onFiltersChange({ fromDate: value })}
              placeholder="Selecciona fecha inicial"
              maxDate={filters.toDate ? new Date(filters.toDate) : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hasta
            </label>
            <DatePicker
              value={filters.toDate}
              onChange={(value) => onFiltersChange({ toDate: value })}
              placeholder="Selecciona fecha final"
              minDate={filters.fromDate ? new Date(filters.fromDate) : undefined}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado
            </label>
            <div className="w-full">
              <AsyncSelect
                value={stateOptions.find((option) => option.value === filters.state) ?? null}
                onChange={(option) =>
                  onFiltersChange({
                    state: (option?.value as JournalStateFilter) ?? 'all',
                  })
                }
                loadOptions={(inputValue) => filterOptions(stateOptions, inputValue)}
                defaultOptions={stateOptions}
                isClearable={false}
                instanceId="accounting-journal-state-filter"
                noOptionsMessage="Sin estados"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Fuente
            </label>
            <div className="w-full">
              <AsyncSelect
                value={sourceOptions.find((option) => option.value === filters.source) ?? null}
                onChange={(option) =>
                  onFiltersChange({
                    source: (option?.value as JournalSourceFilter) ?? 'all',
                  })
                }
                loadOptions={(inputValue) => filterOptions(sourceOptions, inputValue)}
                defaultOptions={sourceOptions}
                isClearable={false}
                instanceId="accounting-journal-source-filter"
                noOptionsMessage="Sin fuentes"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Período
            </label>
            <div className="w-full">
              <AsyncSelect
                value={periodOptions.find((option) => option.value === filters.periodId) ?? null}
                onChange={(option) =>
                  onFiltersChange({ periodId: option?.value ?? '' })
                }
                loadOptions={(inputValue) => filterOptions(periodOptions, inputValue)}
                defaultOptions={periodOptions}
                isDisabled
                isClearable={false}
                instanceId="accounting-journal-period-filter"
                noOptionsMessage="Sin períodos"
              />
            </div>
          </div>
          {onReset ? (
            <div className="flex items-end">
              <button
                type="button"
                onClick={onReset}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Limpiar filtros
              </button>
            </div>
          ) : null}
        </div>
      }
      actions={actions}
    />
  )
}
