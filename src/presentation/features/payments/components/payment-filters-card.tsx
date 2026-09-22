import type { ReactNode } from 'react'

interface PaymentFiltersCardProps {
  loanCode: string
  onLoanCodeChange: (value: string) => void
  clientFilter: ReactNode
  thirdFilter: ReactNode
  thirdFilterLabel: string
  statusFilter: ReactNode
  registeredByFilter?: ReactNode
  fromFilter: ReactNode
  toFilter: ReactNode
  onReset: () => void
  onSearch: () => void
}

const fieldLabelClass =
  'text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'

const inputClass =
  'h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40'

const FilterField = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="min-w-0 space-y-1.5">
    <label className={fieldLabelClass}>{label}</label>
    {children}
  </div>
)

export const PaymentFiltersCard = ({
  loanCode,
  onLoanCodeChange,
  clientFilter,
  thirdFilter,
  thirdFilterLabel,
  statusFilter,
  registeredByFilter,
  fromFilter,
  toFilter,
  onReset,
  onSearch,
}: PaymentFiltersCardProps) => (
  <section
    aria-label="Filtros de consulta"
    className="relative z-20 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-4"
  >
    <div className="grid grid-cols-1 gap-x-3 gap-y-3 md:grid-cols-2 xl:grid-cols-4">
      <FilterField label="Código del préstamo">
        <input
          type="search"
          value={loanCode}
          onChange={(event) => onLoanCodeChange(event.target.value)}
          placeholder="Búsqueda exacta"
          className={inputClass}
        />
      </FilterField>

      <FilterField label="Cliente">{clientFilter}</FilterField>
      <FilterField label={thirdFilterLabel}>{thirdFilter}</FilterField>
      <FilterField label="Estado">{statusFilter}</FilterField>

      {registeredByFilter ? (
        <FilterField label="Usuario registrador">{registeredByFilter}</FilterField>
      ) : null}
      <FilterField label="Desde">{fromFilter}</FilterField>
      <FilterField label="Hasta">{toFilter}</FilterField>
      <div className="flex items-end gap-2 pb-0.5">
        <button type="button" className="btn-secondary btn-list-action" onClick={onReset}>
          Limpiar filtros
        </button>
        <button type="button" className="btn-primary btn-list-action" onClick={onSearch}>
          Buscar
        </button>
      </div>
    </div>
  </section>
)
