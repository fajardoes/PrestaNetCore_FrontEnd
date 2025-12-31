import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLedger } from '@/presentation/features/accounting/ledger/hooks/use-ledger'
import { LedgerFiltersBar } from '@/presentation/features/accounting/ledger/components/ledger-filters-bar'
import { LedgerTable } from '@/presentation/features/accounting/ledger/components/ledger-table'
import { usePostableAccounts } from '@/presentation/features/accounting/hooks/use-postable-accounts'
import { useCostCenterOptions } from '@/presentation/features/accounting/hooks/use-cost-center-options'

export const LedgerPage = () => {
  const { user } = useAuth()
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false

  const ledgerHook = useLedger()
  const accountsHook = usePostableAccounts({ enabled: isAdmin })
  const costCentersHook = useCostCenterOptions({ enabled: isAdmin })

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
    </div>
  )
}
