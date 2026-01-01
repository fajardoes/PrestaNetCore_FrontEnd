import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotifications } from '@/providers/NotificationProvider'
import { useBalanceSheet } from '@/presentation/features/accounting/reports/hooks/use-balance-sheet'
import { useCostCenterOptions } from '@/presentation/features/accounting/hooks/use-cost-center-options'
import { usePeriodOptions } from '@/presentation/features/accounting/hooks/use-period-options'
import {
  financialStatementsReportSchema,
  type FinancialStatementsReportFormValues,
} from '@/infrastructure/validations/accounting/financial-statements-report.schema'
import { FinancialStatementsFilters } from '@/presentation/features/accounting/reports/components/financial-statements-filters'
import { BalanceSheetSummary } from '@/presentation/features/accounting/reports/components/balance-sheet-summary'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import {
  BalanceSheetReport,
  type BalanceSheetReportProps,
} from '@/presentation/components/reports/accounting/balance-sheet-report'

const DEFAULT_VALUES: FinancialStatementsReportFormValues = {
  periodId: '',
  fromDate: '',
  toDate: '',
  costCenterId: '',
}

export const BalanceSheetPage = () => {
  const { notify } = useNotifications()
  const balanceSheet = useBalanceSheet()
  const periodOptions = usePeriodOptions()
  const costCenterOptions = useCostCenterOptions()
  const [showPdf, setShowPdf] = useState(false)

  const form = useForm<FinancialStatementsReportFormValues>({
    resolver: yupResolver(financialStatementsReportSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const reportProps = useMemo<BalanceSheetReportProps | null>(() => {
    if (!balanceSheet.data) return null
    return {
      companyName: 'PrestaNet',
      currencyCode: 'HNL',
      result: balanceSheet.data,
    }
  }, [balanceSheet.data])

  const handleSubmit = (values: FinancialStatementsReportFormValues) => {
    const hasPeriod = Boolean(values.periodId)

    balanceSheet.load({
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
          Contabilidad - Balance general
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Revisa activos, pasivos y patrimonio en el periodo seleccionado.
        </p>
      </div>

      <FinancialStatementsFilters
        form={form}
        periods={periodOptions.periods}
        costCenters={costCenterOptions.costCenters}
        onSubmit={handleSubmit}
        isLoading={balanceSheet.isLoading}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {balanceSheet.data?.costCenterName
            ? `Centro de costo: ${balanceSheet.data.costCenterName}`
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

      <BalanceSheetSummary
        data={balanceSheet.data}
        isLoading={balanceSheet.isLoading}
        error={balanceSheet.error}
      />

      {reportProps ? (
        <PdfViewerDialog
          isOpen={showPdf}
          onClose={() => setShowPdf(false)}
          title="Balance general"
          document={<BalanceSheetReport {...reportProps} />}
        />
      ) : null}
    </div>
  )
}
