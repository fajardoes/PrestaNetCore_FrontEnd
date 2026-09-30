import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { formatDate } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationFirstDueDateCardProps {
  firstDueDate?: string | null
  defaultFirstDueDate?: string | null
  businessDate?: string | null
  disabledDates?: string[]
  canEdit: boolean
  isSaving?: boolean
  embedded?: boolean
  onValueChange?: (value: string) => void
  onSave: (firstDueDate: string) => Promise<void> | void
}

export const LoanApplicationFirstDueDateCard = ({
  firstDueDate,
  defaultFirstDueDate,
  businessDate,
  disabledDates = [],
  canEdit,
  isSaving = false,
  embedded = false,
  onValueChange,
  onSave,
}: LoanApplicationFirstDueDateCardProps) => {
  const [value, setValue] = useState(firstDueDate ?? defaultFirstDueDate ?? '')

  useEffect(() => {
    setValue(firstDueDate ?? defaultFirstDueDate ?? '')
  }, [defaultFirstDueDate, firstDueDate])

  const hasChanged = value !== (firstDueDate ?? '')
  const isUnregisteredSuggestion =
    !firstDueDate && Boolean(defaultFirstDueDate) && value === defaultFirstDueDate

  return (
    <section
      id="loan-application-first-due-date-section"
      className={embedded
        ? 'min-w-0 rounded-lg bg-slate-50/80 p-3 dark:bg-slate-900/70'
        : 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950'}
    >
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Primera fecha de cuota
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Fecha contractual que se revisa antes de aprobar. El sistema ajusta el cobro si coincide con un día no hábil.
        </p>
      </div>

      <div className="mt-3 space-y-2">
        <label htmlFor="loan-application-first-due-date-input" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Fecha de primera cuota
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="w-full max-w-xs">
            <DatePicker
              id="loan-application-first-due-date-input"
              ariaLabel="Seleccionar fecha de primera cuota"
              value={value}
              onChange={(nextValue) => {
                setValue(nextValue)
                onValueChange?.(nextValue)
              }}
              allowFutureDates
              referenceDate={businessDate}
              disableSundays
              disabledDates={disabledDates}
              disabled={!canEdit || isSaving || !businessDate}
            />
          </div>
          {!firstDueDate && defaultFirstDueDate ? (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Sugerida por el plan: {formatDate(defaultFirstDueDate)}. Guarda la fecha para registrarla.
            </p>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              className="btn-primary inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-1"
              disabled={!value || !hasChanged || isSaving || !businessDate}
              onClick={() => void onSave(value)}
              title="Guardar fecha de primera cuota"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          ) : null}
        </div>
      </div>
      {hasChanged && !isUnregisteredSuggestion ? (
        <div role="status" className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <p className="font-semibold">Fecha modificada sin guardar</p>
          <p className="mt-0.5">Registrada: {firstDueDate ? formatDate(firstDueDate) : 'Sin registro'}</p>
          <p>Nueva fecha: {value ? formatDate(value) : 'Sin seleccionar'}</p>
        </div>
      ) : isUnregisteredSuggestion ? (
        <p className="mt-2 rounded-lg bg-slate-50 px-2.5 py-2 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
          Fecha sugerida, aún sin registrar: {formatDate(value)}
        </p>
      ) : firstDueDate ? (
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Fecha registrada: {formatDate(firstDueDate)}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Fecha operativa actual del sistema: {businessDate ? formatDate(businessDate) : 'consultando...'}.
        Debe ser posterior a ella y respetar el plazo y la frecuencia del producto. Los domingos y feriados activos no se pueden seleccionar.
      </p>
    </section>
  )
}
