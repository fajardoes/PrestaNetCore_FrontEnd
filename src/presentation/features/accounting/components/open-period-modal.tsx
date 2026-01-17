import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  openPeriodSchema,
  type OpenPeriodFormValues,
} from '@/infrastructure/validations/accounting/open-period.schema'

interface OpenPeriodModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: OpenPeriodFormValues) => Promise<void> | void
  isSubmitting: boolean
  error?: string | null
}

export const OpenPeriodModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: OpenPeriodModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OpenPeriodFormValues>({
    resolver: yupResolver(openPeriodSchema),
    defaultValues: {
      fiscalYear: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        fiscalYear: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        notes: '',
      })
    }
  }, [open, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Abrir período contable
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selecciona año y mes a abrir. Si ya existe, el backend responderá con el estado actual.
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="fiscalYear"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Año fiscal
              </label>
              <input
                id="fiscalYear"
                type="number"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('fiscalYear', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.fiscalYear ? (
                <p className="text-xs text-red-500">{errors.fiscalYear.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="month"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Mes
              </label>
              <input
                id="month"
                type="number"
                min={1}
                max={12}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('month', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
              {errors.month ? (
                <p className="text-xs text-red-500">{errors.month.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Notas (opcional)
            </label>
            <textarea
              id="notes"
              rows={3}
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
              {isSubmitting ? 'Abriendo...' : 'Abrir período'}
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
