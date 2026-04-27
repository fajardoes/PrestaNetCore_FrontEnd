import {
  formatLoanApplicationScore,
  resolveLoanApplicationScoringBadgeStyle,
  resolveLoanApplicationScoringCardStyle,
  resolveLoanApplicationScoringLabel,
  resolveLoanApplicationScoringVariantClasses,
} from '@/core/helpers/loan-application-scoring-ui'

interface LoanApplicationScoringScoreCardProps {
  scoreValue: number
  colorHex: string
  colorHexDark: string
  uiVariant: string
  riskLevelName: string
  recommendationDisplayName: string
  decisionSummary: string
}

export const LoanApplicationScoringScoreCard = ({
  scoreValue,
  colorHex,
  colorHexDark,
  uiVariant,
  riskLevelName,
  recommendationDisplayName,
  decisionSummary,
}: LoanApplicationScoringScoreCardProps) => {
  const scoringColors = { colorHex, colorHexDark }

  return (
    <article
      className="rounded-lg border p-3 shadow-sm transition"
      style={resolveLoanApplicationScoringCardStyle(scoringColors)}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Score principal
          </p>
          <p className="mt-2 text-4xl font-bold leading-none text-slate-950 dark:text-white">
            {formatLoanApplicationScore(scoreValue)}
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Escala 0 a 100</p>
        </div>
        <span
          className="inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold"
          style={resolveLoanApplicationScoringBadgeStyle(scoringColors)}
        >
          {resolveLoanApplicationScoringLabel(riskLevelName)}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <div className={`rounded-lg border px-2.5 py-2 ${resolveLoanApplicationScoringVariantClasses(uiVariant)}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">
            Recomendación
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            {resolveLoanApplicationScoringLabel(recommendationDisplayName)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-2 text-xs leading-5 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
          {resolveLoanApplicationScoringLabel(decisionSummary)}
        </div>
      </div>
    </article>
  )
}
