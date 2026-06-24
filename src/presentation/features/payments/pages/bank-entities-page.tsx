import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'
import type { BankEntityFormValues } from '@/infrastructure/validations/payments/bank-entity.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { BankEntitiesTable } from '@/presentation/features/payments/components/bank-entities-table'
import { BankEntityFormModal } from '@/presentation/features/payments/components/bank-entity-form-modal'
import { useBankEntityCatalog } from '@/presentation/features/payments/hooks/use-bank-entity-catalog'
import { useBankEntityMutations } from '@/presentation/features/payments/hooks/use-bank-entity-mutations'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'

type StatusFilter = 'all' | 'active' | 'inactive'

export const BankEntitiesPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('bank_entities.read')
  const canManage = hasPermission('bank_entities.manage')
  const catalog = useBankEntityCatalog()
  const mutations = useBankEntityMutations()

  const [items, setItems] = useState<BankEntityResponse[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [editingItem, setEditingItem] = useState<BankEntityResponse | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingStatusItem, setPendingStatusItem] = useState<BankEntityResponse | null>(null)

  const isLoading = catalog.isLoading || isLoadingPermissions

  const statusFlag = useMemo(() => {
    if (status === 'active') return true
    if (status === 'inactive') return false
    return undefined
  }, [status])

  const load = async () => {
    if (!canRead) {
      setItems([])
      return
    }
    const result = await catalog.loadBankEntities({
      search,
      isActive: statusFlag,
    })
    setItems(result)
  }

  useEffect(() => {
    void load()
  }, [canRead, search, statusFlag])

  const resetEditor = () => {
    setCreateOpen(false)
    setEditingItem(null)
    mutations.setError(null)
  }

  const handleSubmit = async (values: BankEntityFormValues) => {
    const payload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      bankGlAccountId: values.bankGlAccountId,
      isActive: values.isActive,
    }

    if (editingItem) {
      const result = await mutations.update(editingItem.id, payload)
      if (!result.success) return
      notify('Entidad bancaria actualizada correctamente.', 'success')
      resetEditor()
      catalog.clearCache()
      await load()
      return
    }

    const result = await mutations.create(payload)
    if (!result.success) return
    notify('Entidad bancaria creada correctamente.', 'success')
    resetEditor()
    catalog.clearCache()
    await load()
  }

  const handleToggleStatus = async () => {
    if (!pendingStatusItem) return
    const targetStatus = !pendingStatusItem.isActive
    const result = await mutations.updateStatus(pendingStatusItem.id, targetStatus)
    if (!result.success) return
    notify(
      targetStatus
        ? 'Entidad bancaria activada correctamente.'
        : 'Entidad bancaria desactivada correctamente.',
      'success',
    )
    setPendingStatusItem(null)
    catalog.clearCache()
    await load()
  }

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Tu usuario no tiene permiso para consultar entidades bancarias.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Entidades bancarias
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Administra los bancos operativos disponibles para registro y aprobación de abonos bancarios.
          </p>
        </div>
        {canManage ? (
          <button
            type="button"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Nueva entidad
          </button>
        ) : null}
      </div>

      <ListFiltersBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(value) => setStatus((value as StatusFilter) || 'all')}
        placeholder="Buscar por código, nombre o descripción"
      />

      <BankEntitiesTable
        items={items}
        isLoading={isLoading}
        error={catalog.error}
        canManage={canManage}
        onEdit={(item) => {
          mutations.setError(null)
          setCreateOpen(false)
          setEditingItem(item)
        }}
        onToggleStatus={setPendingStatusItem}
      />

      <BankEntityFormModal
        open={createOpen || Boolean(editingItem)}
        bankEntity={editingItem}
        isSaving={mutations.isSaving}
        error={mutations.error}
        onClose={resetEditor}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(pendingStatusItem)}
        title={pendingStatusItem?.isActive ? 'Desactivar entidad bancaria' : 'Activar entidad bancaria'}
        description={
          pendingStatusItem?.isActive
            ? 'La entidad dejará de estar disponible para registro y aprobación.'
            : 'La entidad volverá a estar disponible para operación.'
        }
        confirmLabel={pendingStatusItem?.isActive ? 'Desactivar' : 'Activar'}
        isProcessing={mutations.isUpdatingStatus}
        onCancel={() => {
          setPendingStatusItem(null)
          mutations.setError(null)
        }}
        onConfirm={() => void handleToggleStatus()}
      >
        {mutations.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {mutations.error}
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
