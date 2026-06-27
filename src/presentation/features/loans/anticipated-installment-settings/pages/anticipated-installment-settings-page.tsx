import { useEffect, useState } from 'react'
import { listLoanProductsAction } from '@/core/actions/loans/list-loan-products.action'
import { ANTICIPATED_INSTALLMENT_PERMISSIONS } from '@/core/loans/anticipated-installment/constants'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { AnticipatedInstallmentSettingsResponse } from '@/infrastructure/loans/responses/anticipated-installment-response'
import type { AnticipatedInstallmentSettingValues } from '@/infrastructure/validations/loans/anticipated-installment.schema'
import { AnticipatedInstallmentSettingModal } from '@/presentation/features/loans/anticipated-installment-settings/components/anticipated-installment-setting-modal'
import { AnticipatedInstallmentTransitAccountCard } from '@/presentation/features/loans/anticipated-installment-settings/components/anticipated-installment-transit-account-card'
import { useAnticipatedInstallmentSettings } from '@/presentation/features/loans/anticipated-installment-settings/hooks/use-anticipated-installment-settings'
import { useAnticipatedInstallmentTransitAccount } from '@/presentation/features/loans/anticipated-installment-settings/hooks/use-anticipated-installment-transit-account'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { TableContainer } from '@/presentation/share/components/table-container'
import { formatCurrency } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import {
  anticipatedInstallmentStrategyLabel,
  formatAnticipatedInstallmentDate,
} from '@/presentation/features/loans/anticipated-installment/anticipated-installment-ui'

export const AnticipatedInstallmentSettingsPage = () => {
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canReadSettings = hasPermission(ANTICIPATED_INSTALLMENT_PERMISSIONS.settingsRead)
  const canManageSettings = hasPermission(ANTICIPATED_INSTALLMENT_PERMISSIONS.settingsManage)
  const canManageTransitAccount = hasPermission(ANTICIPATED_INSTALLMENT_PERMISSIONS.transitAccountManage)
  const settings = useAnticipatedInstallmentSettings(canReadSettings)
  const transitAccount = useAnticipatedInstallmentTransitAccount(canManageTransitAccount)
  const accounts = useGlAccountsSearch()
  const [products, setProducts] = useState<LoanProductListItemDto[]>([])
  const [editing, setEditing] = useState<AnticipatedInstallmentSettingsResponse | null | undefined>(undefined)
  const [deactivating, setDeactivating] = useState<AnticipatedInstallmentSettingsResponse | null>(null)

  useEffect(() => {
    if (!canReadSettings) {
      setProducts([])
      return
    }
    void listLoanProductsAction({ isActive: true }).then((result) => {
      setProducts(result.success ? result.data : [])
    })
  }, [canReadSettings])

  if (isLoadingPermissions) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando permisos...</p>
  }

  if (!canReadSettings && !canManageTransitAccount) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        Tu usuario no tiene permisos para administrar cuota anticipada.
      </div>
    )
  }

  const saveSetting = async (values: AnticipatedInstallmentSettingValues) => {
    const result = await settings.save(editing?.id ?? null, {
      ...values,
      loanProductId: values.isGlobal ? null : values.loanProductId ?? null,
      maxAmount: values.maxAmount ?? null,
      maxPercentageOfApprovedAmount: values.maxPercentageOfApprovedAmount ?? null,
      authorizationThresholdAmount: values.authorizationThresholdAmount ?? null,
      authorizationThresholdPercentage: values.authorizationThresholdPercentage ?? null,
      effectiveFrom: values.effectiveFrom || null,
      effectiveTo: values.effectiveTo || null,
    })
    if (result.success) setEditing(undefined)
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Cuota anticipada - Configuración</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Reglas de límite y cuenta transitoria usadas por el backend en el flujo de créditos.
        </p>
      </header>

      {canReadSettings ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex flex-wrap justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Reglas vigentes</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Reglas globales o asignadas a producto.</p>
            </div>
            {canManageSettings ? (
              <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => setEditing(null)}>
                Crear regla
              </button>
            ) : null}
          </div>
          {settings.error ? <p className="mb-3 text-sm text-red-700 dark:text-red-300">{settings.error}</p> : null}
          <TableContainer mode="legacy-compact" variant="strong">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead><tr><th>Alcance</th><th>Estrategia</th><th className="text-right">Máximo</th><th className="text-right">% aprobado</th><th>Vigencia</th><th>Estado</th><th className="text-right">Acciones</th></tr></thead>
                <tbody>
                  {settings.isLoading ? (
                    <tr><td colSpan={7} className="py-6 text-center">Cargando configuraciones...</td></tr>
                  ) : !settings.items.length ? (
                    <tr><td colSpan={7} className="py-6 text-center text-slate-500 dark:text-slate-400">No hay reglas configuradas.</td></tr>
                  ) : settings.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.isGlobal ? 'Global' : products.find((product) => product.id === item.loanProductId)?.name ?? item.loanProductId ?? 'Producto'}</td>
                      <td>{anticipatedInstallmentStrategyLabel(item.limitStrategyCode, settings.strategies.find((strategy) => strategy.code === item.limitStrategyCode)?.name)}</td>
                      <td className="text-right">{item.maxAmount == null ? '—' : formatCurrency(item.maxAmount)}</td>
                      <td className="text-right">{item.maxPercentageOfApprovedAmount == null ? '—' : `${item.maxPercentageOfApprovedAmount}%`}</td>
                      <td>{formatAnticipatedInstallmentDate(item.effectiveFrom)} - {formatAnticipatedInstallmentDate(item.effectiveTo)}</td>
                      <td>{item.isActive ? (item.isEnabled ? 'Activa' : 'Deshabilitada') : 'Inactiva'}</td>
                      <td className="space-x-2 text-right">
                        {canManageSettings ? <button type="button" className="btn-table-action" onClick={() => setEditing(item)}>Editar</button> : null}
                        {canManageSettings && item.isActive ? <button type="button" className="btn-table-action" onClick={() => setDeactivating(item)}>Desactivar</button> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableContainer>
        </section>
      ) : null}

      {canManageTransitAccount ? (
        <AnticipatedInstallmentTransitAccountCard
          state={transitAccount.state}
          isLoading={transitAccount.isLoading}
          isSaving={transitAccount.isSaving}
          error={transitAccount.error}
          onSearchAccounts={accounts.searchAccounts}
          onResolveAccount={accounts.getAccountById}
          onSave={async (id) => (await transitAccount.update(id)).success}
        />
      ) : null}

      <AnticipatedInstallmentSettingModal
        open={editing !== undefined}
        setting={editing ?? null}
        products={products}
        strategies={settings.strategies}
        isSaving={settings.isSaving}
        error={settings.error}
        onClose={() => setEditing(undefined)}
        onSubmit={(values) => void saveSetting(values)}
      />
      <ConfirmModal
        open={Boolean(deactivating)}
        title="Desactivar regla"
        description="La regla dejará de estar disponible para nuevas operaciones."
        confirmLabel="Desactivar"
        isProcessing={settings.isSaving}
        onCancel={() => setDeactivating(null)}
        onConfirm={async () => {
          if (!deactivating) return
          const result = await settings.deactivate(deactivating.id)
          if (result.success) setDeactivating(null)
        }}
      />
    </div>
  )
}
