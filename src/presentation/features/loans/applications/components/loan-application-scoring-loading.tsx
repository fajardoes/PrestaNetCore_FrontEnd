export const LoanApplicationScoringLoading = () => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="space-y-3 animate-pulse">
        <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="h-40 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
          <div className="space-y-2">
            <div className="h-16 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
