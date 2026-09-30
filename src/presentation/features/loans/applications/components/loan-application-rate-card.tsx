import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { formatRateAsPercent, mapPercentInputToRate, mapRateToPercentValue } from '@/core/helpers/rate-percent'

interface LoanApplicationRateCardProps {
  currentRate: number | null | undefined
  productNominalRate: number | null | undefined
  minRate: number | null | undefined
  maxRate: number | null | undefined
  canEdit: boolean
  isSaving?: boolean
  embedded?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  onSave: (rate: number | null) => Promise<void> | void
}

interface RateFormValues {
  rate: number | null
}

export const LoanApplicationRateCard = ({
  currentRate,
  productNominalRate,
  minRate,
  maxRate,
  canEdit,
  isSaving = false,
  embedded = false,
  onDirtyChange,
  onSave,
}: LoanApplicationRateCardProps) => {
  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<RateFormValues>({
    defaultValues: {
      rate: currentRate == null ? null : mapRateToPercentValue(currentRate),
    },
  })

  useEffect(() => {
    reset({ rate: currentRate == null ? null : mapRateToPercentValue(currentRate) })
  }, [currentRate, reset])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const hasRange = minRate != null && maxRate != null
  const effectiveRateLabel = currentRate == null
    ? `tasa del producto (${formatRateAsPercent(productNominalRate)})`
    : formatRateAsPercent(currentRate)
  const editedRate = watch('rate')
  const editedRateLabel = editedRate == null
    ? `tasa del producto (${formatRateAsPercent(productNominalRate)})`
    : formatRateAsPercent(mapPercentInputToRate(editedRate))

  return (
    <section
      id="loan-application-rate-section"
      className={embedded
        ? 'min-w-0 rounded-lg bg-slate-50/80 p-3 dark:bg-slate-900/70'
        : 'rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950'}
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Tasa nominal de la solicitud
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Define una tasa manual para esta solicitud. La tasa se utilizará para el plan de pagos y el préstamo desembolsado.
      </p>
      <form
        className="mt-3 grid grid-cols-1 gap-2"
        onSubmit={handleSubmit(async (values) => {
          const rate = values.rate == null || Number.isNaN(values.rate)
            ? null
            : mapPercentInputToRate(values.rate)
          await onSave(rate)
        })}
      >
        <div className="space-y-1">
          <label htmlFor="loan-application-rate-input" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tasa manual (%)
          </label>
          <input
            id="loan-application-rate-input"
            type="number"
            step="0.01"
            placeholder="Tasa del producto"
            disabled={!canEdit || isSaving}
            aria-invalid={Boolean(errors.rate)}
            aria-describedby={errors.rate ? 'loan-application-rate-error' : 'loan-application-rate-help'}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 dark:bg-slate-950 dark:text-slate-100 ${
              isDirty
                ? 'border-amber-400 ring-1 ring-amber-300/70 dark:border-amber-500 dark:ring-amber-500/30'
                : 'border-slate-300 dark:border-slate-700'
            }`}
            {...register('rate', {
              setValueAs: (value) => value === '' ? null : Number(value),
              validate: (value) => {
                if (value == null || Number.isNaN(value)) return true
                if (minRate != null && value < mapRateToPercentValue(minRate)) {
                  return `La tasa mínima es ${formatRateAsPercent(minRate)}.`
                }
                if (maxRate != null && value > mapRateToPercentValue(maxRate)) {
                  return `La tasa máxima es ${formatRateAsPercent(maxRate)}.`
                }
                return true
              },
            })}
          />
          <p id="loan-application-rate-help" className="text-xs text-slate-500 dark:text-slate-400">
            {hasRange
              ? <>Rango permitido: {formatRateAsPercent(minRate)} - {formatRateAsPercent(maxRate)}.{' '}</>
              : null}
            Vacío = {effectiveRateLabel}.
          </p>
          {errors.rate ? (
            <p id="loan-application-rate-error" role="alert" className="text-xs text-red-600 dark:text-red-300">{errors.rate.message}</p>
          ) : null}
        </div>
        {isDirty ? (
          <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
            <p className="font-semibold">Cambio sin guardar</p>
            <p className="mt-0.5">Registrada: {effectiveRateLabel}</p>
            <p>Nuevo valor: {editedRateLabel}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tasa actualmente aplicada: {effectiveRateLabel}
          </p>
        )}
        <button
          type="submit"
          className="btn-primary w-full px-4 py-2 text-sm sm:w-auto"
          disabled={!canEdit || isSaving || !isDirty}
        >
          {isSaving ? 'Guardando...' : 'Guardar tasa'}
        </button>
      </form>
      {!canEdit ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          No tienes habilitada la acción para modificar la tasa nominal.
        </p>
      ) : null}
    </section>
  )
}
