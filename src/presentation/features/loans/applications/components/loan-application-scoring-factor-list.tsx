import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  formatLoanApplicationScoringNumber,
  formatLoanApplicationScoringPoints,
  resolveLoanApplicationScoringLabel,
  resolveLoanApplicationScoringFactorClasses,
} from '@/core/helpers/loan-application-scoring-ui'
import type { LoanApplicationCreditScoreFactorResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-factor.response'

interface LoanApplicationScoringFactorListProps {
  title: string
  items: LoanApplicationCreditScoreFactorResponse[]
  uiVariant: string
  emptyMessage: string
  initialVisibleCount?: number
  sortByImpact?: boolean
}

export const LoanApplicationScoringFactorList = ({
  title,
  items,
  uiVariant,
  emptyMessage,
  initialVisibleCount,
  sortByImpact = false,
}: LoanApplicationScoringFactorListProps) => {
  const [showAll, setShowAll] = useState(false)
  const hiddenItemsId = useId()
  const orderedItems = sortByImpact
    ? [...items].sort(
        (left, right) =>
          (right.impactPoints ?? Number.NEGATIVE_INFINITY) -
          (left.impactPoints ?? Number.NEGATIVE_INFINITY),
      )
    : items
  const visibleLimit = initialVisibleCount ?? orderedItems.length
  const hiddenCount = Math.max(0, orderedItems.length - visibleLimit)
  const visibleItems = orderedItems.slice(0, visibleLimit)
  const hiddenItems = orderedItems.slice(visibleLimit)

  const renderFactor = (item: LoanApplicationCreditScoreFactorResponse) => (
    <article
      key={item.id}
      className={`rounded-lg border px-2.5 py-2 ${resolveLoanApplicationScoringFactorClasses(uiVariant)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-semibold text-slate-900 dark:text-slate-50">
            {resolveLoanApplicationScoringLabel(item.factorName)}
          </p>
          <p className="mt-0.5 break-words text-xs leading-5 text-slate-600 dark:text-slate-300">
            {resolveLoanApplicationScoringLabel(item.description)}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[11px] font-semibold text-inherit">
          {formatLoanApplicationScoringPoints(item.impactPoints)}
        </span>
      </div>
      {item.valueText || item.valueNumeric != null ? (
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          {item.valueText ? (
            <span className="rounded-full border border-slate-300 bg-white/80 px-2 py-0.5 dark:border-slate-600 dark:bg-slate-950/70">
              Resultado: {resolveLoanApplicationScoringLabel(item.valueText)}
            </span>
          ) : null}
          {item.valueNumeric != null ? (
            <span className="rounded-full border border-slate-300 bg-white/80 px-2 py-0.5 dark:border-slate-600 dark:bg-slate-950/70">
              Valor: {formatLoanApplicationScoringNumber(item.valueNumeric)}
            </span>
          ) : null}
        </div>
      ) : null}
    </article>
  )

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{items.length}</span>
      </div>
      {items.length ? (
        <div className="mt-2 space-y-2">
          {visibleItems.map(renderFactor)}
          {hiddenCount ? (
            <>
              <div id={hiddenItemsId} hidden={!showAll} className="space-y-2">
                {hiddenItems.map(renderFactor)}
              </div>
              <button
                type="button"
                className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-expanded={showAll}
                aria-controls={hiddenItemsId}
                onClick={() => setShowAll((isShowing) => !isShowing)}
              >
                {showAll
                  ? 'Mostrar menos'
                  : hiddenCount === 1
                    ? 'Ver 1 más'
                    : `Ver las ${hiddenCount} restantes`}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${showAll ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
      )}
    </section>
  )
}
