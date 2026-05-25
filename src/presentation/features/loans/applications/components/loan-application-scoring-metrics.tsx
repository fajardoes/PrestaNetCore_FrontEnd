import {
  formatLoanApplicationScoringMetricValue,
  resolveLoanApplicationScoringLabel,
} from '@/core/helpers/loan-application-scoring-ui'
import type { LoanApplicationCreditScoreMetricResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-metric.response'

interface LoanApplicationScoringMetricsProps {
  metrics: LoanApplicationCreditScoreMetricResponse[]
}

export const LoanApplicationScoringMetrics = ({
  metrics,
}: LoanApplicationScoringMetricsProps) => {
  const orderedMetrics = [...metrics].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) return left.displayOrder - right.displayOrder
    return left.metricName.localeCompare(right.metricName)
  })

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        Métricas capturadas
      </h3>
      {orderedMetrics.length ? (
        <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {orderedMetrics.map((metric) => (
            <article
              key={metric.id}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {resolveLoanApplicationScoringLabel(metric.metricName)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                {formatLoanApplicationScoringMetricValue(
                  metric.metricValue,
                  metric.metricText,
                  metric.unit,
                )}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          No hay métricas registradas para este scoring.
        </p>
      )}
    </section>
  )
}
