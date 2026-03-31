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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <article
          key={item.key}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {formatLoanApplicationScore(values[item.key])}
          </p>
        </article>
      ))}
    </div>
  )
}
