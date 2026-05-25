import { X } from 'lucide-react'
import { LoanApplicationScoringEmptyState } from '@/presentation/features/loans/applications/components/loan-application-scoring-empty-state'
import { LoanApplicationScoringHistoryTable } from '@/presentation/features/loans/applications/components/loan-application-scoring-history-table'
import { LoanApplicationScoringLoading } from '@/presentation/features/loans/applications/components/loan-application-scoring-loading'
import { LoanApplicationScoringPanel } from '@/presentation/features/loans/applications/components/loan-application-scoring-panel'
import type { LoanApplicationCreditScoreHistoryItemResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-history-item.response'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'

type ScoringTab = 'current' | 'history'

interface LoanApplicationScoringModalProps {
  open: boolean
  tab: ScoringTab
  canViewScoring: boolean
  canViewScoringHistory: boolean
  scoring: LoanApplicationCreditScoreResponse | null
  scoringHistory: LoanApplicationCreditScoreHistoryItemResponse[]
  isScoringLoading: boolean
  isScoringHistoryLoading: boolean
  scoringError: string | null
  scoringHistoryError: string | null
  onTabChange: (tab: ScoringTab) => void
  onClose: () => void
}

export const LoanApplicationScoringModal = ({
  open,
  tab,
  canViewScoring,
  canViewScoringHistory,
  scoring,
  scoringHistory,
  isScoringLoading,
  isScoringHistoryLoading,
  scoringError,
  scoringHistoryError,
  onTabChange,
  onClose,
}: LoanApplicationScoringModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Scoring crediticio
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Evaluación y trazabilidad del análisis crediticio de la solicitud.
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/60 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
            onClick={onClose}
            aria-label="Cerrar scoring crediticio"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {canViewScoring ? (
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  tab === 'current'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
                onClick={() => onTabChange('current')}
              >
                Scoring vigente
              </button>
            ) : null}
            {canViewScoringHistory ? (
              <button
                type="button"
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  tab === 'history'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
                onClick={() => onTabChange('history')}
              >
                Historial
              </button>
            ) : null}
          </div>
        </div>

        <div className="overflow-y-auto bg-slate-50/70 p-3 dark:bg-slate-950">
          {tab === 'current' && canViewScoring ? (
            isScoringLoading ? (
              <LoanApplicationScoringLoading />
            ) : scoring ? (
              <LoanApplicationScoringPanel scoring={scoring} />
            ) : (
              <LoanApplicationScoringEmptyState
                message={scoringError || 'La solicitud no tiene scoring vigente.'}
              />
            )
          ) : null}

          {tab === 'history' && canViewScoringHistory ? (
            <LoanApplicationScoringHistoryTable
              items={scoringHistory}
              isLoading={isScoringHistoryLoading}
              error={scoringHistoryError}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
