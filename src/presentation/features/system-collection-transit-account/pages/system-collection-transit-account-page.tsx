import { useState } from 'react'
import { useNotifications } from '@/providers/NotificationProvider'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { CollectionTransitAccountModal } from '@/presentation/features/system-collection-transit-account/components/collection-transit-account-modal'
import { CollectionTransitAccountSummaryCard } from '@/presentation/features/system-collection-transit-account/components/collection-transit-account-summary-card'
import { useCollectionTransitAccount } from '@/presentation/features/system-collection-transit-account/hooks/use-collection-transit-account'

export const SystemCollectionTransitAccountPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canManage = hasPermission('system.settings.collection_transit_account.manage')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { state, isLoading, isSaving, error, updateSetting } =
    useCollectionTransitAccount(canManage)

  const handleSubmit = async (accountId: string | null) => {
    const success = await updateSetting(accountId)
    if (success) {
      notify('Cuenta transitoria actualizada correctamente.', 'success')
      setIsModalOpen(false)
      return
    }

    notify('No fue posible actualizar la cuenta transitoria.', 'error')
  }

  if (isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando permisos...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Sistema - Cuenta transitoria de recaudo
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra la cuenta temporal utilizada por el backend para registrar pagos operativos.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <CollectionTransitAccountSummaryCard state={state} isLoading={isLoading} />

      {canManage ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Acciones administrativas
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Selecciona una cuenta imputable activa o limpia la referencia actual enviando un valor nulo.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading || isSaving}
            >
              Configurar cuenta
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleSubmit(null)}
              disabled={isLoading || isSaving || !state?.isConfigured}
            >
              Limpiar configuración
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
          <p className="font-semibold">Acceso restringido</p>
          <p className="text-sm">
            Tu usuario no tiene permiso para administrar esta configuración del sistema.
          </p>
        </div>
      )}

      <CollectionTransitAccountModal
        open={isModalOpen}
        state={state}
        isSaving={isSaving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(accountId) => void handleSubmit(accountId)}
      />
    </div>
  )
}
