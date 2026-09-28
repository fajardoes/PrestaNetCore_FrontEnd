import { formatCurrency, hasDisbursementData } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { CollapsibleSection } from '@/presentation/share/components/collapsible-section'

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
  collapsible?: boolean
  defaultExpanded?: boolean
  compact?: boolean
}

export const DisbursementSummaryCard = ({
  title = 'Desembolso',
  emptyMessage = 'No hay datos de desembolso disponibles.',
  data,
  collapsible = false,
  defaultExpanded = true,
  compact = false,
}: DisbursementSummaryCardProps) => {
  if (!hasDisbursementData(data)) {
    if (collapsible) {
      return (
        <CollapsibleSection
          title={title}
          defaultExpanded={defaultExpanded}
          contentClassName="mt-2"
          compact={compact}
          className={compact ? undefined : 'p-3'}
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </CollapsibleSection>
      )
    }

    return (
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      </section>
    )
  }

  const content = (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-7">
      <Metric compact={compact} label="Monto bruto" value={formatCurrency(data.grossDisbursementAmount)} />
      <Metric
        compact={compact}
        label="Comisiones descontadas"
        value={formatCurrency(data.totalDisbursementFees)}
      />
      <Metric
        compact={compact}
        label="Seguro cobrado al desembolso"
        value={formatCurrency(data.totalDisbursementInsurance)}
      />
      <Metric
        compact={compact}
        label="Cuota anticipada retenida"
        value={formatCurrency(data.anticipatedInstallmentDeductionAmount ?? 0)}
      />
      <Metric
        compact={compact}
        label="Seguro futuro programado"
        value={formatCurrency(data.totalScheduledInsurance)}
      />
      <Metric compact={compact} label="Neto a entregar" value={formatCurrency(data.netDisbursementAmount)} />
      <Metric
        compact={compact}
        label="Asiento de desembolso"
        value={
          data.disbursementJournalEntryNumber?.trim() ||
          data.disbursementJournalEntryId?.trim() ||
          '—'
        }
      />
    </div>
  )

  if (collapsible) {
    return (
      <CollapsibleSection
        title={title}
        defaultExpanded={defaultExpanded}
        contentClassName="mt-2"
        compact={compact}
        className={compact ? undefined : 'p-3'}
      >
        {content}
      </CollapsibleSection>
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      <div className="mt-2">{content}</div>
    </section>
  )
}

const Metric = ({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) => (
  <div
    className={`rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900 ${compact ? 'px-2 py-1.5' : 'p-2'}`}
  >
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
