import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { FinancialStatementsReportFormValues } from '@/infrastructure/validations/accounting/financial-statements-report.schema'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import AsyncSelect from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'

interface FinancialStatementsFiltersProps {
  form: UseFormReturn<FinancialStatementsReportFormValues>
  periods: AccountingPeriodDto[]
  costCenters: CostCenter[]
  onSubmit: (values: FinancialStatementsReportFormValues) => void
  isLoading: boolean
}

const buildPeriodLabel = (period: AccountingPeriodDto) => {
  const month = String(period.month).padStart(2, '0')
  return `${period.fiscalYear}-${month} (${period.state})`
}

export const FinancialStatementsFilters = ({
  form,
  periods,
  costCenters,
  onSubmit,
  isLoading,
}: FinancialStatementsFiltersProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = form
  const selectedPeriod = watch('periodId')
  const selectedCostCenterId = watch('costCenterId')
  const withoutCostCenter = watch('withoutCostCenter')
  const fromDate = watch('fromDate')
  const toDate = watch('toDate')
  const disableDates = Boolean(selectedPeriod)
  const periodOptions = useMemo(
    () =>
      periods.map((period) => ({
        value: period.id,
        label: buildPeriodLabel(period),
      })),
    [periods],
  )
  const costCenterOptions = useMemo(
    () =>
      [
        { value: '', label: 'Todos los centros de costo' },
        { value: '__without_cost_center__', label: 'Sin centro de costo' },
        ...costCenters.map((center) => ({
          value: center.id,
          label: `${center.code} - ${center.name}${center.isActive ? '' : ' (Inactivo)'}${center.isDeleted ? ' (Eliminado)' : ''}`,
        })),
      ],
    [costCenters],
  )
  const filterOptions = async (
    options: Array<{ value: string; label: string }>,
    inputValue: string,
  ) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }

  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label
            htmlFor="periodId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Periodo contable
          </label>
          <AsyncSelect
            value={periodOptions.find((option) => option.value === selectedPeriod) ?? null}
            onChange={(option) =>
              setValue('periodId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) => filterOptions(periodOptions, inputValue)}
            inputId="periodId"
            instanceId="accounting-financial-statements-period-id"
            isDisabled={isLoading}
            defaultOptions={periodOptions}
            isClearable
            placeholder="Selecciona un periodo"
            noOptionsMessage="Sin periodos"
          />
          <input type="hidden" {...register('periodId')} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Desde
          </label>
          <DatePicker
            value={fromDate}
            onChange={(value) =>
              setValue('fromDate', value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            onBlur={() =>
              setValue('fromDate', getValues('fromDate'), {
                shouldValidate: true,
                shouldTouch: true,
              })
            }
            error={errors.fromDate?.message}
            disabled={disableDates || isLoading}
            placeholder="Selecciona fecha inicial"
            maxDate={toDate ? new Date(toDate) : undefined}
          />
          <input type="hidden" {...register('fromDate')} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="toDate"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Hasta
          </label>
          <DatePicker
            value={toDate}
            onChange={(value) =>
              setValue('toDate', value, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            onBlur={() =>
              setValue('toDate', getValues('toDate'), {
                shouldValidate: true,
                shouldTouch: true,
              })
            }
            error={errors.toDate?.message}
            disabled={disableDates || isLoading}
            placeholder="Selecciona fecha final"
            minDate={fromDate ? new Date(fromDate) : undefined}
          />
          <input type="hidden" {...register('toDate')} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="costCenterId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Centro de costo
          </label>
          <AsyncSelect
            value={
              costCenterOptions.find((option) =>
                withoutCostCenter
                  ? option.value === '__without_cost_center__'
                  : option.value === selectedCostCenterId,
              ) ?? null
            }
            onChange={(option) => {
              const value = option?.value ?? ''
              setValue('costCenterId', value === '__without_cost_center__' ? '' : value, {
                shouldValidate: true,
              })
              setValue('withoutCostCenter', value === '__without_cost_center__', {
                shouldValidate: true,
              })
            }}
            loadOptions={(inputValue) => filterOptions(costCenterOptions, inputValue)}
            inputId="costCenterId"
            instanceId="accounting-financial-statements-cost-center-id"
            isDisabled={isLoading}
            defaultOptions={costCenterOptions}
            isClearable
            placeholder="Todos"
            noOptionsMessage="Sin centros de costo"
          />
          <input type="hidden" {...register('costCenterId')} />
          <input type="hidden" {...register('withoutCostCenter')} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
        className="btn-primary btn-list-action shadow disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>
    </form>
  )
}
