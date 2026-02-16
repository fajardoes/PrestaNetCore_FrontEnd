import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker } from '@/presentation/share/components/date-picker'
import {
  loanSchedulePreviewSchema,
  type LoanSchedulePreviewFormValues,
} from '@/infrastructure/validations/loans/loan-schedule-preview.schema'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { yupResolver } from '@hookform/resolvers/yup'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'

interface LoanApplicationPaymentPlanModalProps {
  open: boolean
  isLoading?: boolean
  preview: LoanSchedulePreviewResponse | null
  onGenerate: (values: LoanSchedulePreviewFormValues) => void
  listPaymentFrequencies: () => Promise<LoanCatalogItemDto[]>
  initialValues?: Partial<LoanSchedulePreviewFormValues>
  onClose: () => void
}

const defaultValues: LoanSchedulePreviewFormValues = {
  principalOverride: null,
  termOverride: null,
  paymentFrequencyIdOverride: null,
  nominalRateOverride: null,
  firstDueDateOverride: null,
}

const formatInterestMethod = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'interest_by_days') return 'Interés por días'
  if (normalized === 'interest_by_period') return 'Interés por período'
  if (normalized === 'flat') return 'Interés fijo'
  return value.replaceAll('_', ' ')
}

export const LoanApplicationPaymentPlanModal = ({
  open,
  isLoading = false,
  preview,
  onGenerate,
  listPaymentFrequencies,
  initialValues,
  onClose,
}: LoanApplicationPaymentPlanModalProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [frequencyOptions, setFrequencyOptions] = useState<LoanCatalogItemDto[]>([])
  const [frequencyLoading, setFrequencyLoading] = useState(false)
  const [frequencyError, setFrequencyError] = useState<string | null>(null)
  const resolvedDefaultValues = useMemo<LoanSchedulePreviewFormValues>(
    () => ({
      principalOverride: initialValues?.principalOverride ?? defaultValues.principalOverride,
      termOverride: initialValues?.termOverride ?? defaultValues.termOverride,
      paymentFrequencyIdOverride:
        initialValues?.paymentFrequencyIdOverride ?? defaultValues.paymentFrequencyIdOverride,
      nominalRateOverride: initialValues?.nominalRateOverride ?? defaultValues.nominalRateOverride,
      firstDueDateOverride: initialValues?.firstDueDateOverride ?? defaultValues.firstDueDateOverride,
    }),
    [initialValues],
  )

  const { control, register, handleSubmit, reset, formState: { errors } } =
    useForm<LoanSchedulePreviewFormValues>({
      resolver: yupResolver(loanSchedulePreviewSchema),
      defaultValues: resolvedDefaultValues,
    })

  useEffect(() => {
    if (!open) return
    reset(resolvedDefaultValues)
  }, [open, reset, resolvedDefaultValues])

  useEffect(() => {
    if (!open || !showAdvanced || frequencyOptions.length) return

    const loadFrequencies = async () => {
      setFrequencyLoading(true)
      setFrequencyError(null)
      try {
        const items = await listPaymentFrequencies()
        setFrequencyOptions(items)
      } catch (error) {
        setFrequencyOptions([])
        setFrequencyError(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar las frecuencias de pago.',
        )
      } finally {
        setFrequencyLoading(false)
      }
    }

    void loadFrequencies()
  }, [open, showAdvanced, frequencyOptions.length, listPaymentFrequencies])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Plan de pagos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vista previa con los datos actuales de la solicitud.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => {
              reset(resolvedDefaultValues)
              setShowAdvanced((prev) => !prev)
            }}>
              {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
            </button>
            <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {showAdvanced ? (
            <form
              className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900"
              onSubmit={handleSubmit((values) => onGenerate(values))}
            >
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Monto (ajuste)
                </label>
                <input
                  type="number"
                  step="0.01"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  {...register('principalOverride', { valueAsNumber: true })}
                />
                {errors.principalOverride ? (
                  <p className="text-xs text-red-600 dark:text-red-300">{errors.principalOverride.message}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Plazo (ajuste)
                </label>
                <input
                  type="number"
                  step="1"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  {...register('termOverride', { valueAsNumber: true })}
                />
                {errors.termOverride ? (
                  <p className="text-xs text-red-600 dark:text-red-300">{errors.termOverride.message}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Frecuencia (ajuste)
                </label>
                <select
                  disabled={isLoading || frequencyLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  {...register('paymentFrequencyIdOverride')}
                >
                  <option value="">{frequencyLoading ? 'Cargando...' : 'Opcional'}</option>
                  {frequencyOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {frequencyError ? (
                  <p className="text-xs text-red-600 dark:text-red-300">{frequencyError}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tasa nominal (ajuste)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej. 24 o 24.5"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  {...register('nominalRateOverride', { valueAsNumber: true })}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ingresa el porcentaje anual (24 = 24%).
                </p>
                {errors.nominalRateOverride ? (
                  <p className="text-xs text-red-600 dark:text-red-300">{errors.nominalRateOverride.message}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Primera cuota (ajuste)
                </label>
                <Controller
                  name="firstDueDateOverride"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      allowFutureDates
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              <div className="flex items-end md:col-span-3">
                <button type="submit" className="btn-primary px-4 py-2 text-xs" disabled={isLoading}>
                  {isLoading ? 'Generando...' : 'Aplicar ajustes y generar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                className="btn-primary px-3 py-1.5 text-xs"
                onClick={() => onGenerate(resolvedDefaultValues)}
                disabled={isLoading}
              >
                {isLoading ? 'Generando...' : 'Generar plan de pagos'}
              </button>
            </div>
          )}

          {!preview ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Aún no hay vista previa generada. Haz clic en <strong>Generar plan de pagos</strong>.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                <Meta label="Tasa nominal" value={formatRateAsPercent(preview.metadata.nominalRate)} />
                <Meta
                  label="Tasa efectiva por período"
                  value={formatRateAsPercent(preview.metadata.effectivePeriodRate)}
                />
                <Meta
                  label="Método de interés"
                  value={formatInterestMethod(preview.metadata.interestCalculationMethod)}
                />
                <Meta
                  label="Ajuste de última cuota"
                  value={formatMoney(preview.metadata.lastInstallmentAdjustment)}
                />
              </div>

              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    <th className="px-2 py-2">#</th>
                    <th className="px-2 py-2">Vence</th>
                    <th className="px-2 py-2">Ajustada</th>
                    <th className="px-2 py-2">Capital</th>
                    <th className="px-2 py-2">Interés</th>
                    <th className="px-2 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.installments.map((row) => (
                    <tr key={row.installmentNo} className="border-b border-slate-200/70 dark:border-slate-800">
                      <td className="px-2 py-2">{row.installmentNo}</td>
                      <td className="px-2 py-2">{row.dueDateOriginal}</td>
                      <td className="px-2 py-2">{row.dueDateAdjusted}</td>
                      <td className="px-2 py-2">{formatMoney(row.principal)}</td>
                      <td className="px-2 py-2">{formatMoney(row.interest)}</td>
                      <td className="px-2 py-2">{formatMoney(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
