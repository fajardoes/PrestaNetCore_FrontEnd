import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { TrialBalanceReportFormValues } from '@/infrastructure/validations/accounting/trial-balance-report.schema'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import AsyncSelect from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'

interface TrialBalanceFiltersProps {
  form: UseFormReturn<TrialBalanceReportFormValues>
  periods: AccountingPeriodDto[]
  costCenters: CostCenter[]
  onSubmit: (values: TrialBalanceReportFormValues) => void
  isLoading: boolean
}

const buildPeriodLabel = (period: AccountingPeriodDto) => {
  const month = String(period.month).padStart(2, '0')
  return `${period.fiscalYear}-${month} (${period.state})`
}

export const TrialBalanceFilters = ({
  form,
  periods,
  costCenters,
  onSubmit,
  isLoading,
}: TrialBalanceFiltersProps) => {
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
      costCenters.map((center) => ({
        value: center.id,
        label: `${center.code} - ${center.name}`,
      })),
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
            instanceId="accounting-trial-balance-period-id"
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
              costCenterOptions.find((option) => option.value === selectedCostCenterId) ??
              null
            }
            onChange={(option) =>
              setValue('costCenterId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) => filterOptions(costCenterOptions, inputValue)}
            inputId="costCenterId"
            instanceId="accounting-trial-balance-cost-center-id"
            isDisabled={isLoading}
            defaultOptions={costCenterOptions}
            isClearable
            placeholder="Todos"
            noOptionsMessage="Sin centros de costo"
          />
          <input type="hidden" {...register('costCenterId')} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
            {...register('includeSubaccounts')}
            disabled={isLoading}
          />
          <span className="text-sm text-slate-800 dark:text-slate-100">
            Incluir subcuentas
          </span>
        </label>
        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
            {...register('includeZeroBalanceAccounts')}
            disabled={isLoading}
          />
          <span className="text-sm text-slate-800 dark:text-slate-100">
            Incluir cuentas en cero
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Consultando...' : 'Consultar'}
        </button>
      </div>
    </form>
  )
}
