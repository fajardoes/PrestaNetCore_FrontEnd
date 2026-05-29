import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import {
  loanSchedulePreviewSchema,
  type LoanSchedulePreviewFormValues,
} from '@/infrastructure/validations/loans/loan-schedule-preview.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import {
  formatInterestCalculationMethod,
  formatDate,
  formatPaymentFrequencyCode,
  formatTermUnitCode,
  getInstallmentComponentAmount,
  formatMoney,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LoanApplicationSchedulePreviewCardProps {
  isLoading?: boolean
  canPreview: boolean
  preview: LoanSchedulePreviewResponse | null
  onPreview: (values: LoanSchedulePreviewFormValues) => Promise<void> | void
  searchPaymentFrequencies: (
    input: string,
  ) => Promise<AsyncSelectOption<LoanCatalogItemDto>[]>
}

const defaultValues: LoanSchedulePreviewFormValues = {
  principalOverride: null,
  termOverride: null,
  paymentFrequencyIdOverride: null,
  nominalRateOverride: null,
  firstDueDateOverride: null,
}

export const LoanApplicationSchedulePreviewCard = ({
  isLoading = false,
  canPreview,
  preview,
  onPreview,
  searchPaymentFrequencies,
}: LoanApplicationSchedulePreviewCardProps) => {
  const [frequencyOption, setFrequencyOption] =
    useState<AsyncSelectOption<LoanCatalogItemDto> | null>(null)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoanSchedulePreviewFormValues>({
    resolver: yupResolver(loanSchedulePreviewSchema),
    defaultValues,
  })

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Vista previa del cronograma
      </h2>

      <form
        className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"
        onSubmit={handleSubmit(async (values) => {
          await onPreview(values)
        })}
      >
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Capital a simular
          </label>
          <input
            type="number"
            step="0.01"
            disabled={!canPreview || isLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            {...register('principalOverride', { valueAsNumber: true })}
          />
          {errors.principalOverride ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.principalOverride.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Duración a simular (unidad contractual)
          </label>
          <input
            type="number"
            step="1"
            disabled={!canPreview || isLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            {...register('termOverride', { valueAsNumber: true })}
          />
          {errors.termOverride ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.termOverride.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Frecuencia de cuotas
          </label>
          <Controller
            control={control}
            name="paymentFrequencyIdOverride"
            render={({ field }) => (
              <AsyncSelect<LoanCatalogItemDto>
                value={frequencyOption}
                onChange={(option) => {
                  setFrequencyOption(option)
                  field.onChange(option?.value ?? '')
                }}
                loadOptions={searchPaymentFrequencies}
                isClearable
                placeholder="Opcional"
                isDisabled={!canPreview || isLoading}
              />
            )}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Tasa nominal (ajuste)
          </label>
          <input
            type="number"
            step="0.01"
            placeholder="Ej. 24 o 24.5"
            disabled={!canPreview || isLoading}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
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
                disabled={!canPreview || isLoading}
              />
            )}
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="btn-primary px-4 py-2 text-sm"
            disabled={!canPreview || isLoading}
          >
            {isLoading ? 'Previsualizando...' : 'Previsualizar'}
          </button>
        </div>
      </form>

      {preview ? (
        <div className="mt-4 space-y-3">
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
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Las fechas de cobro pueden ajustarse por días no hábiles sin modificar el
            vencimiento contractual.
          </p>

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
      ) : null}
    </section>
  )
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
