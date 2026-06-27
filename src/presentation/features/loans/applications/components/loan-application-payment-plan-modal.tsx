import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Printer } from 'lucide-react'
import { DatePicker } from '@/presentation/share/components/date-picker'
import SelectField from '@/presentation/share/components/select'
import {
  loanSchedulePreviewSchema,
  type LoanSchedulePreviewFormValues,
} from '@/infrastructure/validations/loans/loan-schedule-preview.schema'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import {
  formatInterestCalculationMethod,
  formatDate,
  getInstallmentComponentAmount,
  formatMoney,
  formatPaymentFrequencyCode,
  formatTermUnitCode,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { yupResolver } from '@hookform/resolvers/yup'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import { LoanPaymentPlanReport } from '@/presentation/components/reports/loans/loan-payment-plan-report'
import { DisbursementChargesTable } from '@/presentation/features/loans/components/disbursement-charges-table'
import { DisbursementSummaryCard } from '@/presentation/features/loans/components/disbursement-summary-card'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LoanApplicationPaymentPlanModalProps {
  open: boolean
  isLoading?: boolean
  preview: LoanSchedulePreviewResponse | null
  onGenerate: (values: LoanSchedulePreviewFormValues) => void
  listPaymentFrequencies: () => Promise<LoanCatalogItemDto[]>
  initialValues?: Partial<LoanSchedulePreviewFormValues>
  termUnitName?: string
  applicationLabel?: string
  onClose: () => void
}

const defaultValues: LoanSchedulePreviewFormValues = {
  principalOverride: null,
  termOverride: null,
  paymentFrequencyIdOverride: null,
  nominalRateOverride: null,
  firstDueDateOverride: null,
}

export const LoanApplicationPaymentPlanModal = ({
  open,
  isLoading = false,
  preview,
  onGenerate,
  listPaymentFrequencies,
  initialValues,
  termUnitName,
  applicationLabel,
  onClose,
}: LoanApplicationPaymentPlanModalProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [isPdfOpen, setIsPdfOpen] = useState(false)
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
  const lastInstallment = preview?.installments.at(-1)
  const hasAdjustedLastPayment =
    Boolean(lastInstallment) &&
    lastInstallment?.dueDateAdjusted !== lastInstallment?.dueDateOriginal

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
            <button
              type="button"
              className="btn-print px-3 py-1.5 text-xs"
              onClick={() => setIsPdfOpen(true)}
              disabled={!preview}
            >
              <Printer className="h-4 w-4" />
              Imprimir
            </button>
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
                  Capital a simular
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
                  Duración a simular ({termUnitName || 'unidad contractual'})
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
                  Frecuencia de cuotas
                </label>
                <Controller
                  name="paymentFrequencyIdOverride"
                  control={control}
                  render={({ field }) => (
                    <SelectField<LoanCatalogItemDto>
                      value={
                        frequencyOptions
                          .filter((item) => item.id === field.value)
                          .map((item) => ({ value: item.id, label: item.name, meta: item }))[0] ??
                        null
                      }
                      onChange={(option) => field.onChange(option?.value ?? null)}
                      options={frequencyOptions.map((item) => ({
                        value: item.id,
                        label: item.name,
                        meta: item,
                      }))}
                      placeholder="Opcional"
                      isClearable
                      isDisabled={isLoading || frequencyLoading}
                      isLoading={frequencyLoading}
                    />
                  )}
                />
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
                <Meta
                  label="Duración contractual"
                  value={`${preview.metadata.contractualTerm} ${formatTermUnitCode(preview.metadata.termUnitCode)}`}
                />
                <Meta
                  label="Frecuencia de pago"
                  value={formatPaymentFrequencyCode(preview.metadata.paymentFrequencyCode)}
                />
                <Meta
                  label="Vencimiento contractual"
                  value={formatDate(preview.metadata.maturityDate)}
                />
                <Meta
                  label="Cuotas generadas"
                  value={String(preview.metadata.installmentsCount)}
                />
                <Meta label="Tasa nominal" value={formatRateAsPercent(preview.metadata.nominalRate)} />
                <Meta
                  label="Tasa efectiva por período"
                  value={formatRateAsPercent(preview.metadata.effectivePeriodRate)}
                />
                <Meta
                  label="Método de interés"
                  value={formatInterestCalculationMethod(preview.metadata.interestCalculationMethod)}
                />
                <Meta
                  label="Ajuste de última cuota"
                  value={formatMoney(preview.metadata.lastInstallmentAdjustment)}
                />
              </div>
              {hasAdjustedLastPayment ? (
                <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
                  Último pago ajustado por calendario: {formatDate(lastInstallment?.dueDateAdjusted)}.
                  El vencimiento contractual se mantiene en{' '}
                  {formatDate(preview.metadata.maturityDate)}.
                </p>
              ) : null}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Las fechas de cobro pueden ajustarse por días no hábiles sin modificar el
                vencimiento contractual.
              </p>

              {preview.disbursement ? (
                <>
                  <DisbursementSummaryCard
                    title="Resumen proyectado del desembolso"
                    data={preview.disbursement}
                  />
                  <DisbursementChargesTable charges={preview.disbursement.charges} />
                </>
              ) : null}

              <TableContainer mode="legacy-compact" variant="strong">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fecha original</th>
                        <th>Fecha de cobro</th>
                        <th className="text-right">Capital</th>
                        <th className="text-right">Interés</th>
                        <th className="text-right">Seguro</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.installments.map((row) => (
                        <tr key={row.installmentNo}>
                          <td className="px-2 py-2">{row.installmentNo}</td>
                          <td className="px-2 py-2">{formatDate(row.dueDateOriginal)}</td>
                          <td className="px-2 py-2">{formatDate(row.dueDateAdjusted)}</td>
                          <td className="px-2 py-2 text-right">{formatMoney(row.principal)}</td>
                          <td className="px-2 py-2 text-right">{formatMoney(row.interest)}</td>
                          <td className="px-2 py-2 text-right">
                            {formatMoney(getInstallmentComponentAmount(row.components, 'INSURANCE'))}
                          </td>
                          <td className="px-2 py-2 text-right">{formatMoney(row.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TableContainer>
            </div>
          )}
        </div>
      </div>

      {preview ? (
        <PdfViewerDialog
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          title="Plan de pagos"
          document={
            <LoanPaymentPlanReport
              preview={preview}
              applicationLabel={applicationLabel}
            />
          }
        />
      ) : null}
    </div>
  )
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
