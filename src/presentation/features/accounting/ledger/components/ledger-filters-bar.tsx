import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { LedgerFiltersState } from '@/presentation/features/accounting/ledger/hooks/use-ledger'

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
          <select
            value={filters.accountId}
            onChange={(event) => onFiltersChange({ accountId: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          >
            <option value="">Selecciona una cuenta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Desde
          </label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) => onFiltersChange({ fromDate: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Hasta
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(event) => onFiltersChange({ toDate: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Centro de costo
          </label>
          <select
            value={filters.costCenterId}
            onChange={(event) => onFiltersChange({ costCenterId: event.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          >
            <option value="">Todos</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.code} - {center.name}
              </option>
            ))}
          </select>
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
