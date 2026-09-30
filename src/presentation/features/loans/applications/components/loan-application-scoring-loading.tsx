export const LoanApplicationScoringLoading = () => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="animate-pulse space-y-4">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-12 w-44 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[minmax(17rem,0.9fr)_minmax(0,2.1fr)]">
          <div className="h-52 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900" />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-16 rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
