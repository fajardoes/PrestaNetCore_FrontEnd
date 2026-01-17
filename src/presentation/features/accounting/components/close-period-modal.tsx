import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  closePeriodSchema,
  type ClosePeriodFormValues,
} from '@/infrastructure/validations/accounting/close-period.schema'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

interface ClosePeriodModalProps {
  open: boolean
  period?: AccountingPeriodDto | null
  nextPeriodPreview?: { month: number; fiscalYear: number } | null
  onClose: () => void
  onSubmit: (values: ClosePeriodFormValues) => Promise<void> | void
  isSubmitting: boolean
  error?: string | null
}

export const ClosePeriodModal = ({
  open,
  period,
  nextPeriodPreview,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: ClosePeriodModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClosePeriodFormValues>({
    resolver: yupResolver(closePeriodSchema),
    defaultValues: {
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({ notes: '' })
    }
  }, [open, reset])

  if (!open || !period) return null

  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  const currentMonthLabel = monthNames[period.month - 1] ?? `Mes ${period.month}`
  const nextMonthLabel = nextPeriodPreview
    ? monthNames[nextPeriodPreview.month - 1] ?? `Mes ${nextPeriodPreview.month}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Cerrar período {period.fiscalYear}-{String(period.month).padStart(2, '0')}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Al cerrar <span className="font-semibold">{currentMonthLabel} {period.fiscalYear}</span>, el sistema abrirá automáticamente{' '}
              {nextPeriodPreview && nextMonthLabel ? (
                <span className="font-semibold">
                  {nextMonthLabel} {nextPeriodPreview.fiscalYear}
                </span>
              ) : (
                <span className="font-semibold">el siguiente mes</span>
              )}
              .
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes ? (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cerrando...' : 'Cerrar período'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
