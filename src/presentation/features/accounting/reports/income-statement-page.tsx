import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotifications } from '@/providers/NotificationProvider'
import { useIncomeStatement } from '@/presentation/features/accounting/reports/hooks/use-income-statement'
import { useCostCenterOptions } from '@/presentation/features/accounting/hooks/use-cost-center-options'
import { usePeriodOptions } from '@/presentation/features/accounting/hooks/use-period-options'
import {
  financialStatementsReportSchema,
  type FinancialStatementsReportFormValues,
} from '@/infrastructure/validations/accounting/financial-statements-report.schema'
import { FinancialStatementsFilters } from '@/presentation/features/accounting/reports/components/financial-statements-filters'
import { IncomeStatementSummary } from '@/presentation/features/accounting/reports/components/income-statement-summary'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import {
  IncomeStatementReport,
  type IncomeStatementReportProps,
} from '@/presentation/components/reports/accounting/income-statement-report'

const DEFAULT_VALUES: FinancialStatementsReportFormValues = {
  periodId: '',
  fromDate: '',
  toDate: '',
  costCenterId: '',
}

export const IncomeStatementPage = () => {
  const { notify } = useNotifications()
  const incomeStatement = useIncomeStatement()
  const periodOptions = usePeriodOptions()
  const costCenterOptions = useCostCenterOptions()
  const [showPdf, setShowPdf] = useState(false)

  const form = useForm<FinancialStatementsReportFormValues>({
    resolver: yupResolver(financialStatementsReportSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const reportProps = useMemo<IncomeStatementReportProps | null>(() => {
    if (!incomeStatement.data) return null
    return {
      companyName: 'PrestaNet',
      currencyCode: 'HNL',
      result: incomeStatement.data,
    }
  }, [incomeStatement.data])

  const handleSubmit = (values: FinancialStatementsReportFormValues) => {
    const hasPeriod = Boolean(values.periodId)

    incomeStatement.load({
      periodId: values.periodId || undefined,
      fromDate: hasPeriod ? undefined : values.fromDate || undefined,
      toDate: hasPeriod ? undefined : values.toDate || undefined,
      costCenterId: values.costCenterId || undefined,
    })
  }

  const handleExportPdf = () => {
    if (!reportProps) {
      notify('No hay informacion para exportar.', 'warning')
      return
    }
    setShowPdf(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Estado de resultados
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Analiza ingresos, gastos y el resultado neto del periodo.
        </p>
      </div>

      <FinancialStatementsFilters
        form={form}
        periods={periodOptions.periods}
        costCenters={costCenterOptions.costCenters}
        onSubmit={handleSubmit}
        isLoading={incomeStatement.isLoading}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {incomeStatement.data?.costCenterName
            ? `Centro de costo: ${incomeStatement.data.costCenterName}`
            : 'Todos los centros de costo'}
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={!reportProps}
        >
          Exportar a PDF
        </button>
      </div>

      <IncomeStatementSummary
        data={incomeStatement.data}
        isLoading={incomeStatement.isLoading}
        error={incomeStatement.error}
      />

      {reportProps ? (
        <PdfViewerDialog
          isOpen={showPdf}
          onClose={() => setShowPdf(false)}
          title="Estado de resultados"
          document={<IncomeStatementReport {...reportProps} />}
        />
      ) : null}
    </div>
  )
}
