import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotifications } from '@/providers/NotificationProvider'
import { useTrialBalance } from '@/presentation/features/accounting/reports/hooks/use-trial-balance'
import { useCostCenterOptions } from '@/presentation/features/accounting/hooks/use-cost-center-options'
import { usePeriodOptions } from '@/presentation/features/accounting/hooks/use-period-options'
import {
  trialBalanceReportSchema,
  type TrialBalanceReportFormValues,
} from '@/infrastructure/validations/accounting/trial-balance-report.schema'
import { TrialBalanceFilters } from '@/presentation/features/accounting/reports/components/trial-balance-filters'
import { TrialBalanceTable } from '@/presentation/features/accounting/reports/components/trial-balance-table'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import {
  TrialBalanceReport,
  type TrialBalanceReportProps,
} from '@/presentation/components/reports/accounting/trial-balance-report'

const DEFAULT_VALUES: TrialBalanceReportFormValues = {
  periodId: '',
  fromDate: '',
  toDate: '',
  costCenterId: '',
  includeSubaccounts: true,
  includeZeroBalanceAccounts: false,
}

export const TrialBalancePage = () => {
  const { notify } = useNotifications()
  const trialBalance = useTrialBalance()
  const periodOptions = usePeriodOptions()
  const costCenterOptions = useCostCenterOptions()
  const [showPdf, setShowPdf] = useState(false)

  const form = useForm<TrialBalanceReportFormValues>({
    resolver: yupResolver(trialBalanceReportSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const reportProps = useMemo<TrialBalanceReportProps | null>(() => {
    if (!trialBalance.data) return null
    return {
      companyName: 'PrestaNet',
      currencyCode: 'HNL',
      result: trialBalance.data,
    }
  }, [trialBalance.data])

  const handleSubmit = (values: TrialBalanceReportFormValues) => {
    const hasPeriod = Boolean(values.periodId)

    trialBalance.load({
      periodId: values.periodId || undefined,
      fromDate: hasPeriod ? undefined : values.fromDate || undefined,
      toDate: hasPeriod ? undefined : values.toDate || undefined,
      costCenterId: values.costCenterId || undefined,
      includeSubaccounts: values.includeSubaccounts,
      includeZeroBalanceAccounts: values.includeZeroBalanceAccounts,
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
          Contabilidad - Balance de comprobacion
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Resume saldos y movimientos por cuenta para validar consistencia.
        </p>
      </div>

      <TrialBalanceFilters
        form={form}
        periods={periodOptions.periods}
        costCenters={costCenterOptions.costCenters}
        onSubmit={handleSubmit}
        isLoading={trialBalance.isLoading}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {trialBalance.data?.costCenterName
            ? `Centro de costo: ${trialBalance.data.costCenterName}`
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

      <TrialBalanceTable
        data={trialBalance.data}
        isLoading={trialBalance.isLoading}
        error={trialBalance.error}
      />

      {reportProps ? (
        <PdfViewerDialog
          isOpen={showPdf}
          onClose={() => setShowPdf(false)}
          title="Balance de comprobacion"
          document={<TrialBalanceReport {...reportProps} />}
        />
      ) : null}
    </div>
  )
}
