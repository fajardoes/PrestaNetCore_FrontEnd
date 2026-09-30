import { AlertCircle, ArrowDown, Info } from 'lucide-react'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import {
  financialProfileBadgeClass,
  financialProfileCompletenessBadgeClass,
  formatDateTime,
  formatRatio,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationReviewPanelProps {
  application: LoanApplicationResponse
  canApprove: boolean
  isApprovalAllowed: boolean
  blockers: Array<{ message: string; field?: 'rate' | 'date' }>
  onOpenFinancialProfile: () => void
  onFocusPendingField: (field: 'rate' | 'date') => void
}

export const LoanApplicationReviewPanel = ({
  application,
  canApprove,
  isApprovalAllowed,
  blockers,
  onOpenFinancialProfile,
  onFocusPendingField,
}: LoanApplicationReviewPanelProps) => {
  const hasFinancialProfile = Boolean(application.hasFinancialProfile)
  const isFinancialProfileComplete = Boolean(application.isFinancialProfileComplete)
  const hasBlockers = blockers.length > 0

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Asignación y ficha</h2>
        <dl className="mt-2 space-y-2">
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Promotor</dt>
            <dd className="break-words text-sm font-medium text-slate-800 dark:text-slate-100">
              {application.promoterClientFullName || '—'}
            </dd>
          </div>
          <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
            <dt className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Ficha financiera</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${financialProfileBadgeClass(hasFinancialProfile)}`}>
                {hasFinancialProfile ? 'Registrada' : 'Sin ficha'}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${financialProfileCompletenessBadgeClass(isFinancialProfileComplete)}`}>
                {isFinancialProfileComplete ? 'Completa' : 'Incompleta'}
              </span>
            </dd>
            <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
              <p>Actualizada: {formatDateTime(application.financialProfileUpdatedAt)}</p>
              <p>Pasivos / activos: {formatRatio(application.financialDebtRatio)}</p>
              <p>Pasivos / patrimonio: {formatRatio(application.financialDebtToEquityRatio)}</p>
            </div>
          </div>
        </dl>
        <button
          type="button"
          className="btn-secondary mt-3 w-full px-3 py-2 text-sm"
          onClick={onOpenFinancialProfile}
        >
          Abrir ficha financiera
        </button>
      </section>

      {(canApprove || blockers.length > 0) ? (
        <section
          aria-labelledby="loan-application-approval-review-title"
          className={`rounded-xl border p-3 ${hasBlockers
            ? 'border-amber-200 bg-amber-50/80 dark:border-amber-500/40 dark:bg-amber-500/10'
            : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'}`}
        >
          <div className="flex items-start gap-2">
            {hasBlockers ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <h2 id="loan-application-approval-review-title" className={`text-sm font-semibold ${hasBlockers
                ? 'text-amber-950 dark:text-amber-100'
                : 'text-slate-900 dark:text-slate-100'}`}>
                {hasBlockers ? 'Pendientes para aprobar' : 'Estado de aprobación'}
              </h2>
              {blockers.length ? (
                <ul id="loan-application-approval-blockers" className="mt-1.5 space-y-2 text-xs text-amber-900 dark:text-amber-100">
                  {blockers.map((blocker, index) => (
                    <li key={`${blocker.field ?? 'server'}-${index}`}>
                      <p>{blocker.message}</p>
                      {blocker.field ? (
                        <button
                          type="button"
                          className="mt-1 inline-flex items-center gap-1 font-semibold underline decoration-amber-700/60 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:decoration-amber-300/60"
                          onClick={() => onFocusPendingField(blocker.field!)}
                        >
                          Revisar campo pendiente
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {isApprovalAllowed
                    ? 'No hay bloqueos para aprobar esta solicitud.'
                    : 'La aprobación no está disponible en el estado actual.'}
                </p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
