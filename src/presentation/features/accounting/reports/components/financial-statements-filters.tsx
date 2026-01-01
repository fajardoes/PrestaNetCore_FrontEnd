import type { UseFormReturn } from 'react-hook-form'
import type { FinancialStatementsReportFormValues } from '@/infrastructure/validations/accounting/financial-statements-report.schema'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'

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
    watch,
    formState: { errors },
  } = form
  const selectedPeriod = watch('periodId')
  const disableDates = Boolean(selectedPeriod)

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
          <select
            id="periodId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('periodId')}
            disabled={isLoading}
          >
            <option value="">Selecciona un periodo</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {buildPeriodLabel(period)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="fromDate"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Desde
          </label>
          <input
            id="fromDate"
            type="date"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 dark:disabled:bg-slate-900"
            {...register('fromDate')}
            disabled={disableDates || isLoading}
          />
          {errors.fromDate ? (
            <p className="text-xs text-red-500">{errors.fromDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="toDate"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Hasta
          </label>
          <input
            id="toDate"
            type="date"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 dark:disabled:bg-slate-900"
            {...register('toDate')}
            disabled={disableDates || isLoading}
          />
          {errors.toDate ? (
            <p className="text-xs text-red-500">{errors.toDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="costCenterId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Centro de costo
          </label>
          <select
            id="costCenterId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('costCenterId')}
            disabled={isLoading}
          >
            <option value="">Todos</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.code} - {center.name}
              </option>
            ))}
          </select>
        </div>
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
