import { formatCurrency, hasDisbursementData } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface DisbursementSummaryData {
  grossDisbursementAmount?: number | null
  totalDisbursementFees?: number | null
  totalDisbursementInsurance?: number | null
  anticipatedInstallmentDeductionAmount?: number | null
  totalScheduledInsurance?: number | null
  netDisbursementAmount?: number | null
  disbursementJournalEntryId?: string | null
  disbursementJournalEntryNumber?: string | null
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
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-7">
        <Metric label="Monto bruto" value={formatCurrency(data.grossDisbursementAmount)} />
        <Metric
          label="Comisiones descontadas"
          value={formatCurrency(data.totalDisbursementFees)}
        />
        <Metric
          label="Seguro cobrado al desembolso"
          value={formatCurrency(data.totalDisbursementInsurance)}
        />
        <Metric
          label="Cuota anticipada retenida"
          value={formatCurrency(data.anticipatedInstallmentDeductionAmount ?? 0)}
        />
        <Metric
          label="Seguro futuro programado"
          value={formatCurrency(data.totalScheduledInsurance)}
        />
        <Metric label="Neto a entregar" value={formatCurrency(data.netDisbursementAmount)} />
        <Metric
          label="Asiento de desembolso"
          value={
            data.disbursementJournalEntryNumber?.trim() ||
            data.disbursementJournalEntryId?.trim() ||
            '—'
          }
        />
      </div>
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
