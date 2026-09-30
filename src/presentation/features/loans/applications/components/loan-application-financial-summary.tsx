import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import { formatCurrency } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'

interface LoanApplicationFinancialSummaryProps {
  application: LoanApplicationResponse
  productNominalRate?: number | null
}

export const LoanApplicationFinancialSummary = ({
  application,
  productNominalRate,
}: LoanApplicationFinancialSummaryProps) => {
  const indicators = [
    { label: 'Capital solicitado', value: formatCurrency(application.requestedPrincipal) },
    {
      label: 'Plazo',
      value: `${application.requestedTerm} ${application.requestedTermUnitName}`,
    },
    {
      label: 'Tasa nominal',
      value: formatRateAsPercent(application.requestedRateOverride ?? productNominalRate),
    },
    { label: 'Frecuencia', value: application.requestedPaymentFrequencyName },
  ]

  return (
    <section
      aria-label="Resumen financiero de la solicitud"
      className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-4"
    >
      {indicators.map((indicator, index) => (
        <div
          key={indicator.label}
          className={`min-w-0 rounded-lg px-3 py-2 ${
            index === 0
              ? 'bg-sky-50 dark:bg-sky-500/10'
              : 'bg-slate-50 dark:bg-slate-900'
          }`}
        >
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {indicator.label}
          </p>
          <p className="mt-0.5 break-words text-base font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {indicator.value}
          </p>
        </div>
      ))}
    </section>
  )
}
