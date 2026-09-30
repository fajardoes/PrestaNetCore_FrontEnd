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
  onValueChange,
  onSave,
}: LoanApplicationFirstDueDateCardProps) => {
  const [value, setValue] = useState(firstDueDate ?? defaultFirstDueDate ?? '')

  useEffect(() => {
    setValue(firstDueDate ?? defaultFirstDueDate ?? '')
  }, [defaultFirstDueDate, firstDueDate])

  const hasChanged = value !== (firstDueDate ?? '')

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Primera fecha de cuota
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Define la fecha contractual que el analista revisará antes de aprobar la solicitud.
            El sistema ajustará el cobro si coincide con un día no hábil.
          </p>
        </div>
        {firstDueDate ? (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
            Registrada: {formatDate(firstDueDate)}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="w-full max-w-xs space-y-1">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fecha de primera cuota
          </label>
          <DatePicker
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
          {!firstDueDate && defaultFirstDueDate ? (
            <p className="text-xs text-sky-700 dark:text-sky-300">
              Sugerida por el plan de pagos: {formatDate(defaultFirstDueDate)}. Confírmala y
              guárdala para utilizarla en el flujo de aprobación.
            </p>
          ) : null}
        </div>
        {canEdit ? (
          <button
            type="button"
            className="btn-primary inline-flex h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:mt-7"
            disabled={!value || !hasChanged || isSaving || !businessDate}
            onClick={() => void onSave(value)}
            title="Guardar fecha de primera cuota"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Fecha operativa actual del sistema: {businessDate ? formatDate(businessDate) : 'consultando...'}.
        Debe ser posterior a ella y respetar el plazo y la frecuencia del producto. Los domingos y feriados activos no se pueden seleccionar.
      </p>
    </section>
  )
}
