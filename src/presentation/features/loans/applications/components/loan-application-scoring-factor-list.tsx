import {
  formatLoanApplicationScore,
  resolveLoanApplicationScoringFactorClasses,
} from '@/core/helpers/loan-application-scoring-ui'
import type { LoanApplicationCreditScoreFactorResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-factor.response'

interface LoanApplicationScoringFactorListProps {
  title: string
  items: LoanApplicationCreditScoreFactorResponse[]
  uiVariant: string
  emptyMessage: string
}

export const LoanApplicationScoringFactorList = ({
  title,
  items,
  uiVariant,
  emptyMessage,
}: LoanApplicationScoringFactorListProps) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {title}
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{items.length}</span>
      </div>
      {items.length ? (
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <article
              key={item.id}
              className={`rounded-lg border px-2.5 py-2 ${resolveLoanApplicationScoringFactorClasses(uiVariant)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {item.factorName}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-semibold text-inherit">
                  {formatLoanApplicationScore(item.impactPoints)} pts
                </span>
              </div>
              {item.valueText || item.valueNumeric != null ? (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {item.valueText ? (
                    <span className="rounded-full border border-slate-300 bg-white/80 px-2 py-0.5 dark:border-slate-600 dark:bg-slate-950/70">
                      Valor: {item.valueText}
                    </span>
                  ) : null}
                  {item.valueNumeric != null ? (
                    <span className="rounded-full border border-slate-300 bg-white/80 px-2 py-0.5 dark:border-slate-600 dark:bg-slate-950/70">
                      Dato: {formatLoanApplicationScore(item.valueNumeric)}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      )}
    </section>
  )
}
