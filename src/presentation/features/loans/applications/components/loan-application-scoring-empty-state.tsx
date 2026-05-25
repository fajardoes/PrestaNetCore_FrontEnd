interface LoanApplicationScoringEmptyStateProps {
  message?: string
}

export const LoanApplicationScoringEmptyState = ({
  message = 'La solicitud no tiene scoring vigente.',
}: LoanApplicationScoringEmptyStateProps) => {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Scoring crediticio
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </section>
  )
}
