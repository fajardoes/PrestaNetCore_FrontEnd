import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import { useLedger } from '@/presentation/features/accounting/ledger/hooks/use-ledger'
import { LedgerFiltersBar } from '@/presentation/features/accounting/ledger/components/ledger-filters-bar'
import { LedgerTable } from '@/presentation/features/accounting/ledger/components/ledger-table'
import { usePostableAccounts } from '@/presentation/features/accounting/hooks/use-postable-accounts'
import { useCostCenterOptions } from '@/presentation/features/accounting/hooks/use-cost-center-options'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import {
  GeneralLedgerReport,
  type GeneralLedgerReportProps,
} from '@/presentation/components/reports/accounting/general-ledger-report'

export const LedgerPage = () => {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false

  const ledgerHook = useLedger()
  const accountsHook = usePostableAccounts({ enabled: isAdmin })
  const costCentersHook = useCostCenterOptions({ enabled: isAdmin })
  const [showLedgerPdf, setShowLedgerPdf] = useState(false)

  const canShowRestriction = useMemo(() => !isAdmin, [isAdmin])

  if (canShowRestriction) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden consultar el libro mayor.
        </p>
      </div>
    )
  }

  const hasAccount = Boolean(ledgerHook.filters.accountId)
  const selectedAccount = useMemo(
    () => accountsHook.accounts.find((account) => account.id === ledgerHook.filters.accountId),
    [accountsHook.accounts, ledgerHook.filters.accountId],
  )

  const ledgerReportProps = useMemo<GeneralLedgerReportProps | null>(() => {
    if (!selectedAccount) return null
    if (!ledgerHook.entries.length) return null

    const totalDebit = ledgerHook.entries.reduce((sum, entry) => sum + entry.debit, 0)
    const totalCredit = ledgerHook.entries.reduce((sum, entry) => sum + entry.credit, 0)
    const finalBalance = ledgerHook.entries[ledgerHook.entries.length - 1]?.balance ?? 0
    const periodLabel = (() => {
      if (ledgerHook.filters.fromDate && ledgerHook.filters.toDate) {
        return `${ledgerHook.filters.fromDate} al ${ledgerHook.filters.toDate}`
      }
      if (ledgerHook.filters.fromDate) {
        return `Desde ${ledgerHook.filters.fromDate}`
      }
      if (ledgerHook.filters.toDate) {
        return `Hasta ${ledgerHook.filters.toDate}`
      }
      return 'Todos'
    })()
    const formatDate = (value: string) => {
      const isoDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
      if (isoDateMatch) {
        return `${isoDateMatch[3]}/${isoDateMatch[2]}/${isoDateMatch[1]}`
      }
      const parsed = new Date(value)
      if (Number.isNaN(parsed.getTime())) return value
      return parsed.toLocaleDateString('es-HN')
    }

    return {
      accountCode: selectedAccount.code,
      accountName: selectedAccount.name,
      currencyCode: 'HNL',
      periodLabel,
      openingBalance: ledgerHook.openingBalance ?? 0,
      lines: ledgerHook.entries.map((entry) => ({
        date: formatDate(entry.date),
        documentNumber: '-',
        journalEntryNumber: entry.journalNumber ?? '-',
        description: entry.description,
        debit: entry.debit,
        credit: entry.credit,
        balance: entry.balance,
      })),
      totals: {
        totalDebit,
        totalCredit,
        finalBalance,
      },
      organizationName: 'PrestaNet',
    }
  }, [
    ledgerHook.entries,
    ledgerHook.filters.fromDate,
    ledgerHook.filters.toDate,
    ledgerHook.openingBalance,
    selectedAccount,
  ])

  const handleExportPdf = () => {
    if (!ledgerReportProps) {
      notify('No hay informacion para generar el reporte.', 'warning')
      return
    }
    setShowLedgerPdf(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Libro mayor
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consulta movimientos y saldo acumulado por cuenta contable.
        </p>
      </div>

      <LedgerFiltersBar
        filters={ledgerHook.filters}
        onFiltersChange={(next) =>
          ledgerHook.setFilters((prev) => ({ ...prev, ...next }))
        }
        accounts={accountsHook.accounts}
        accountSearch={accountsHook.search}
        onAccountSearch={accountsHook.setSearch}
        costCenters={costCentersHook.costCenters}
        onSubmit={ledgerHook.reload}
        isLoading={ledgerHook.isLoading}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {selectedAccount
            ? `${selectedAccount.code} - ${selectedAccount.name}`
            : 'Selecciona una cuenta para exportar el mayor.'}
        </div>
        <button
          type="button"
          onClick={handleExportPdf}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={!ledgerReportProps}
        >
          Exportar a PDF
        </button>
      </div>

      {!hasAccount ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          Seleccione una cuenta contable para ver el libro mayor.
        </div>
      ) : (
        <LedgerTable
          entries={ledgerHook.entries}
          openingBalance={ledgerHook.openingBalance}
          isLoading={ledgerHook.isLoading}
          error={ledgerHook.error}
        />
      )}

      {ledgerReportProps ? (
        <PdfViewerDialog
          isOpen={showLedgerPdf}
          onClose={() => setShowLedgerPdf(false)}
          title="Mayor contable"
          document={<GeneralLedgerReport {...ledgerReportProps} />}
        />
      ) : null}
    </div>
  )
}
