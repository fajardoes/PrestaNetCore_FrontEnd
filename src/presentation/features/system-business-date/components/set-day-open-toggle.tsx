interface SetDayOpenToggleProps {
  isDayOpen: boolean
  isLoading?: boolean
  onChange: (next: boolean) => void
}

export const SetDayOpenToggle = ({
  isDayOpen,
  isLoading,
  onChange,
}: SetDayOpenToggleProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Estado del día
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cambia entre día abierto o cerrado.
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
            isDayOpen
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'
          }`}
        >
          {isDayOpen ? 'Abierto' : 'Cerrado'}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Cambiar estado del día">
        <button
          type="button"
          className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition ${
            isDayOpen
              ? 'border-emerald-200 bg-emerald-500 text-white dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
          }`}
          onClick={() => onChange(true)}
          aria-pressed={isDayOpen}
          disabled={isLoading || isDayOpen}
        >
          Abrir día
        </button>
        <button
          type="button"
          className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition ${
            !isDayOpen
              ? 'border-amber-300 bg-amber-500 text-white dark:border-amber-500 dark:bg-amber-500'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
          }`}
          onClick={() => onChange(false)}
          aria-pressed={!isDayOpen}
          disabled={isLoading || !isDayOpen}
        >
          Cerrar día
        </button>
      </div>
    </div>
  )
}
