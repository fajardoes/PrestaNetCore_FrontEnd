import {
  formatLoanApplicationScoringDate,
  formatLoanApplicationScoringDateTime,
  resolveLoanApplicationScoringLabel,
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
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Scoring crediticio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Evaluación ejecutiva generada por el motor de scoring.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
          <Info label="Generado">
            {formatLoanApplicationScoringDateTime(scoring.generatedAt)}
          </Info>
          <Info label="Usuario">{resolveLoanApplicationScoringLabel(scoring.generatedBy)}</Info>
          <Info label="Fecha operativa">
            {formatLoanApplicationScoringDate(scoring.businessDate)}
          </Info>
          <Info label="Motor">
            v{scoring.scoreVersion} · {resolveLoanApplicationScoringLabel(scoring.engineVersion)}
          </Info>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
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
        <div className="space-y-3">
          <LoanApplicationScoringSubscores
            capacityScore={scoring.capacityScore}
            financialScore={scoring.financialScore}
            collateralScore={scoring.collateralScore}
            behaviorScore={scoring.behaviorScore}
            productFitScore={scoring.productFitScore}
          />
          <LoanApplicationScoringMetrics metrics={scoring.metrics} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <LoanApplicationScoringFactorList
          title="Fortalezas"
          items={scoring.positiveFactors}
          uiVariant="success"
          emptyMessage="No hay fortalezas registradas."
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
