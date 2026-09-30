import { formatLoanApplicationScore } from '@/core/helpers/loan-application-scoring-ui'

interface LoanApplicationScoringSubscoresProps {
  capacityScore: number | null
  financialScore: number | null
  collateralScore: number | null
  behaviorScore: number | null
  productFitScore: number | null
}

const items = [
  { key: 'capacityScore', label: 'Capacidad' },
  { key: 'financialScore', label: 'Solvencia financiera' },
  { key: 'collateralScore', label: 'Garantías' },
  { key: 'behaviorScore', label: 'Consistencia documental' },
  { key: 'productFitScore', label: 'Ajuste al producto' },
] as const

export const LoanApplicationScoringSubscores = ({
  capacityScore,
  financialScore,
  collateralScore,
  behaviorScore,
  productFitScore,
}: LoanApplicationScoringSubscoresProps) => {
  const values = {
    capacityScore,
    financialScore,
    collateralScore,
    behaviorScore,
    productFitScore,
  }

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => (
        <article
          key={item.key}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex min-h-11 items-start justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {item.label}
            </p>
            <p className="shrink-0 text-lg font-bold leading-none text-slate-900 dark:text-slate-50">
              {formatLoanApplicationScore(values[item.key])}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
            {values[item.key] != null ? (
              <div
                className="h-full rounded-full bg-sky-600 transition-[width] dark:bg-sky-400"
                style={{ width: `${Math.min(100, Math.max(0, values[item.key] ?? 0))}%` }}
              />
            ) : null}
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">de 100</p>
        </article>
      ))}
    </div>
  )
}
