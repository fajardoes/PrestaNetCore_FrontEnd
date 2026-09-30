import {
  formatLoanApplicationScoringDate,
  formatLoanApplicationScoringDateTime,
  formatLoanApplicationScoringUser,
} from '@/core/helpers/loan-application-scoring-ui'
import type { ReactNode } from 'react'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'
import { LoanApplicationScoringFactorList } from '@/presentation/features/loans/applications/components/loan-application-scoring-factor-list'
import { LoanApplicationScoringMetrics } from '@/presentation/features/loans/applications/components/loan-application-scoring-metrics'
import { LoanApplicationScoringScoreCard } from '@/presentation/features/loans/applications/components/loan-application-scoring-score-card'
import { LoanApplicationScoringSubscores } from '@/presentation/features/loans/applications/components/loan-application-scoring-subscores'

interface LoanApplicationScoringPanelProps {
  scoring: LoanApplicationCreditScoreResponse
}

export const LoanApplicationScoringPanel = ({
  scoring,
}: LoanApplicationScoringPanelProps) => {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Info label="Generada">
            {formatLoanApplicationScoringDateTime(scoring.generatedAt)}
          </Info>
          <Info label="Fecha operativa">
            {formatLoanApplicationScoringDate(scoring.businessDate)}
          </Info>
          {scoring.generatedBy ? (
            <Info label="Registrada por">
              <span title={scoring.generatedBy}>
                {formatLoanApplicationScoringUser(scoring.generatedBy)}
              </span>
            </Info>
          ) : null}
        </div>
        {scoring.isCurrent ? (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/30">
            Evaluación vigente
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(17rem,0.9fr)_minmax(0,2.1fr)]">
        <LoanApplicationScoringScoreCard
          scoreValue={scoring.scoreValue}
          colorHex={scoring.colorHex}
          colorHexDark={scoring.colorHexDark}
          uiVariant={scoring.uiVariant}
          riskLevelName={scoring.riskLevelDisplayName || scoring.riskLevelName}
          recommendationDisplayName={
            scoring.recommendationDisplayName || scoring.recommendationName
          }
          decisionSummary={scoring.decisionSummary}
        />
        <LoanApplicationScoringSubscores
          capacityScore={scoring.capacityScore}
          financialScore={scoring.financialScore}
          collateralScore={scoring.collateralScore}
          behaviorScore={scoring.behaviorScore}
          productFitScore={scoring.productFitScore}
        />
      </div>

      <LoanApplicationScoringMetrics metrics={scoring.metrics} />

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-3">
        <LoanApplicationScoringFactorList
          title="Fortalezas"
          items={scoring.positiveFactors}
          uiVariant="success"
          emptyMessage="No hay fortalezas registradas."
          initialVisibleCount={4}
          sortByImpact
        />
        <LoanApplicationScoringFactorList
          title="Alertas"
          items={scoring.negativeFactors}
          uiVariant="danger"
          emptyMessage="No hay alertas registradas."
        />
        <LoanApplicationScoringFactorList
          title="Observaciones"
          items={scoring.infoFactors}
          uiVariant="neutral"
          emptyMessage="No hay observaciones registradas."
          initialVisibleCount={4}
        />
      </div>
    </section>
  )
}

const Info = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-100">{children}</p>
  </div>
)
