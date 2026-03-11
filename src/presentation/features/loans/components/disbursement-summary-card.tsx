import { formatCurrency, hasDisbursementData } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface DisbursementSummaryData {
  grossDisbursementAmount?: number | null
  totalDisbursementFees?: number | null
  totalDisbursementInsurance?: number | null
  netDisbursementAmount?: number | null
  disbursementJournalEntryId?: string | null
}

interface DisbursementSummaryCardProps {
  title?: string
  emptyMessage?: string
  data: DisbursementSummaryData
}

export const DisbursementSummaryCard = ({
  title = 'Desembolso',
  emptyMessage = 'No hay datos de desembolso disponibles.',
  data,
}: DisbursementSummaryCardProps) => {
  if (!hasDisbursementData(data)) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Monto bruto" value={formatCurrency(data.grossDisbursementAmount)} />
        <Metric
          label="Comisiones descontadas"
          value={formatCurrency(data.totalDisbursementFees)}
        />
        <Metric
          label="Seguros descontados"
          value={formatCurrency(data.totalDisbursementInsurance)}
        />
        <Metric label="Neto desembolsado" value={formatCurrency(data.netDisbursementAmount)} />
        <Metric
          label="Asiento de desembolso"
          value={data.disbursementJournalEntryId?.trim() || '—'}
        />
      </div>
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
