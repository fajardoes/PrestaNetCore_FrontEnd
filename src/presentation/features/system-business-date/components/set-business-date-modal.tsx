import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  businessDateSchema,
  type BusinessDateFormValues,
} from '@/infrastructure/validations/system/business-date.schema'

interface SetBusinessDateModalProps {
  open: boolean
  initialDate?: string | null
  onClose: () => void
  onSubmit: (date: string) => Promise<void> | void
  isSubmitting: boolean
  error?: string | null
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export const SetBusinessDateModal = ({
  open,
  initialDate,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: SetBusinessDateModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BusinessDateFormValues>({
    resolver: yupResolver(businessDateSchema),
    defaultValues: {
      businessDate: initialDate ?? todayIso(),
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      businessDate: initialDate ?? todayIso(),
    })
  }, [open, initialDate, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Cambiar fecha operativa
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ajusta la fecha operativa vigente. Esta acción queda registrada en el backend.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
            disabled={isSubmitting}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values.businessDate)
          })}
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="businessDate"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Fecha operativa
            </label>
            <input
              id="businessDate"
              type="date"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('businessDate')}
              disabled={isSubmitting}
            />
            {errors.businessDate ? (
              <p className="text-xs text-red-500">{errors.businessDate.message}</p>
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
              {isSubmitting ? 'Actualizando...' : 'Actualizar fecha'}
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
