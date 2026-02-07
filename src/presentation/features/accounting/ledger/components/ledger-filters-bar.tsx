import { useMemo } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { LedgerFiltersState } from '@/presentation/features/accounting/ledger/hooks/use-ledger'
import AsyncSelect from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'

interface LedgerFiltersBarProps {
  filters: LedgerFiltersState
  onFiltersChange: (next: Partial<LedgerFiltersState>) => void
  accounts: ChartAccountListItem[]
  accountSearch: string
  onAccountSearch: (value: string) => void
  costCenters?: CostCenter[]
  onSubmit: () => void
  isLoading: boolean
}

export const LedgerFiltersBar = ({
  filters,
  onFiltersChange,
  accounts,
  accountSearch,
  onAccountSearch,
  costCenters = [],
  onSubmit,
  isLoading,
}: LedgerFiltersBarProps) => {
  const accountOptions = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.id,
        label: `${account.code} - ${account.name}`,
      })),
    [accounts],
  )
  const costCenterOptions = useMemo(
    () =>
      costCenters.map((center) => ({
        value: center.id,
        label: `${center.code} - ${center.name}`,
      })),
    [costCenters],
  )
  const filterSelectOptions = async (
    options: Array<{ value: string; label: string }>,
    inputValue: string,
  ) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Buscar cuenta
          </label>
          <input
            type="search"
            value={accountSearch}
            onChange={(event) => onAccountSearch(event.target.value)}
            placeholder="Código o nombre..."
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Cuenta contable
          </label>
          <AsyncSelect
            value={accountOptions.find((option) => option.value === filters.accountId) ?? null}
            onChange={(option) => onFiltersChange({ accountId: option?.value ?? '' })}
            loadOptions={(inputValue) => filterSelectOptions(accountOptions, inputValue)}
            defaultOptions={accountOptions}
            isClearable
            placeholder="Selecciona una cuenta"
            instanceId="accounting-ledger-account-filter"
            noOptionsMessage="Sin cuentas"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Desde
          </label>
          <DatePicker
            value={filters.fromDate}
            onChange={(value) => onFiltersChange({ fromDate: value })}
            placeholder="Selecciona fecha inicial"
            maxDate={filters.toDate ? new Date(filters.toDate) : undefined}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Hasta
          </label>
          <DatePicker
            value={filters.toDate}
            onChange={(value) => onFiltersChange({ toDate: value })}
            placeholder="Selecciona fecha final"
            minDate={filters.fromDate ? new Date(filters.fromDate) : undefined}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Centro de costo
          </label>
          <AsyncSelect
            value={
              costCenterOptions.find((option) => option.value === filters.costCenterId) ?? null
            }
            onChange={(option) => onFiltersChange({ costCenterId: option?.value ?? '' })}
            loadOptions={(inputValue) => filterSelectOptions(costCenterOptions, inputValue)}
            defaultOptions={costCenterOptions}
            isClearable
            placeholder="Todos"
            instanceId="accounting-ledger-cost-center-filter"
            noOptionsMessage="Sin centros de costo"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
              checked={filters.includeOpeningBalance}
              onChange={(event) =>
                onFiltersChange({ includeOpeningBalance: event.target.checked })
              }
            />
            Incluir saldo inicial
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>
    </div>
  )
}
