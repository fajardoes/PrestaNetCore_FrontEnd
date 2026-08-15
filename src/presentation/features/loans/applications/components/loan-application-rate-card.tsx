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
  onSave,
}: LoanApplicationRateCardProps) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RateFormValues>({
    defaultValues: {
      rate: currentRate == null ? null : mapRateToPercentValue(currentRate),
    },
  })

  useEffect(() => {
    reset({ rate: currentRate == null ? null : mapRateToPercentValue(currentRate) })
  }, [currentRate, reset])

  const hasRange = minRate != null && maxRate != null
  const effectiveRateLabel = currentRate == null
    ? `tasa del producto (${formatRateAsPercent(productNominalRate)})`
    : formatRateAsPercent(currentRate)

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Tasa nominal de la solicitud
      </h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Define una tasa manual para esta solicitud. La tasa se utilizará para el plan de pagos y el préstamo desembolsado.
      </p>
      <form
        className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,18rem)_1fr_auto] md:items-end"
        onSubmit={handleSubmit(async (values) => {
          const rate = values.rate == null || Number.isNaN(values.rate)
            ? null
            : mapPercentInputToRate(values.rate)
          await onSave(rate)
        })}
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tasa manual (%)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Tasa del producto"
            disabled={!canEdit || isSaving}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
          {hasRange ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rango permitido: {formatRateAsPercent(minRate)} - {formatRateAsPercent(maxRate)}.
              {' '}Vacío = {effectiveRateLabel}.
            </p>
          ) : null}
          {errors.rate ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.rate.message}</p>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 md:pb-2">
          Tasa actualmente aplicada: {effectiveRateLabel}
        </p>
        <button
          type="submit"
          className="btn-primary px-4 py-2 text-sm"
          disabled={!canEdit || isSaving}
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
