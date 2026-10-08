import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'
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
  businessDate?: string | null
  businessDateLoading?: boolean
  businessDateError?: string | null
}

interface PeriodChoice {
  fiscalYear: number
  month: number
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const OpenPeriodModal = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  businessDate,
  businessDateLoading = false,
  businessDateError,
}: OpenPeriodModalProps) => {
  const periodOptions = useMemo<SelectOption<PeriodChoice>[]>(() => {
    if (!businessDate) return []

    const [fiscalYear, month] = businessDate.split('-').map(Number)
    if (
      !Number.isInteger(fiscalYear) ||
      !Number.isInteger(month) ||
      fiscalYear < 2000 ||
      month < 1 ||
      month > 12
    ) {
      return []
    }

    const nextPeriod = month === 12
      ? { fiscalYear: fiscalYear + 1, month: 1 }
      : { fiscalYear, month: month + 1 }

    return [
      { fiscalYear, month },
      nextPeriod,
    ].map((period) => ({
      value: `${period.fiscalYear}-${String(period.month).padStart(2, '0')}`,
      label: `${period.fiscalYear}-${String(period.month).padStart(2, '0')} · ${monthNames[period.month - 1] ?? `Mes ${period.month}`}`,
      meta: period,
    }))
  }, [businessDate])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OpenPeriodFormValues>({
    resolver: yupResolver(openPeriodSchema),
    defaultValues: {
      fiscalYear: periodOptions[0]?.meta?.fiscalYear ?? 2000,
      month: periodOptions[0]?.meta?.month ?? 1,
      notes: '',
    },
  })

  const fiscalYear = watch('fiscalYear')
  const month = watch('month')
  const selectedPeriod = periodOptions.find(
    (option) => option.meta?.fiscalYear === fiscalYear && option.meta?.month === month,
  ) ?? null

  useEffect(() => {
    if (open) {
      reset({
        fiscalYear: periodOptions[0]?.meta?.fiscalYear ?? 2000,
        month: periodOptions[0]?.meta?.month ?? 1,
        notes: '',
      })
    }
  }, [open, periodOptions, reset])

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
              Solo puedes habilitar el período operativo o el mes inmediatamente siguiente. Los períodos anteriores se gestionan como ajustes.
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
            if (!periodOptions.some(
              (option) => option.meta?.fiscalYear === values.fiscalYear && option.meta?.month === values.month,
            )) {
              return
            }
            await onSubmit(values)
          })}
          noValidate
        >
          <input type="hidden" {...register('fiscalYear', { valueAsNumber: true })} />
          <input type="hidden" {...register('month', { valueAsNumber: true })} />
          <div className="space-y-2">
            <label
              htmlFor="accounting-period-to-open"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Período a habilitar
            </label>
            <SelectField<PeriodChoice>
              value={selectedPeriod}
              onChange={(option) => {
                if (!option?.meta) return
                setValue('fiscalYear', option.meta.fiscalYear, { shouldValidate: true })
                setValue('month', option.meta.month, { shouldValidate: true })
              }}
              options={periodOptions}
              inputId="accounting-period-to-open"
              instanceId="accounting-period-to-open"
              placeholder={businessDateLoading ? 'Cargando fecha operativa...' : 'Selecciona un período'}
              isClearable={false}
              isDisabled={isSubmitting || periodOptions.length === 0}
              noOptionsMessage="No hay períodos habilitados para apertura"
            />
            {!periodOptions.length ? (
              <p className="text-xs text-amber-700 dark:text-amber-200" role="status">
                {businessDateLoading
                  ? 'Cargando la fecha operativa para determinar el período permitido.'
                  : businessDateError ?? 'No se pudo resolver la fecha operativa. No es posible abrir un período.'}
              </p>
            ) : null}
            {errors.fiscalYear || errors.month ? (
              <p className="text-xs text-red-500">
                {errors.fiscalYear?.message ?? errors.month?.message}
              </p>
            ) : null}
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
              disabled={isSubmitting || periodOptions.length === 0}
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
