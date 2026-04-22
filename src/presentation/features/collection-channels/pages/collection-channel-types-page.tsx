import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import type { CollectionChannelTypeFormValues } from '@/infrastructure/validations/collection-channels/collection-channel-type.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { CollectionChannelTypeFormModal } from '@/presentation/features/collection-channels/components/collection-channel-type-form-modal'
import { CollectionChannelTypesTable } from '@/presentation/features/collection-channels/components/collection-channel-types-table'
import { useCollectionChannelTypeMutations } from '@/presentation/features/collection-channels/hooks/use-collection-channel-type-mutations'
import { useCollectionChannelTypes } from '@/presentation/features/collection-channels/hooks/use-collection-channel-types'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const toPayload = (values: CollectionChannelTypeFormValues) => ({
  code: values.code.trim(),
  name: values.name.trim(),
  description: normalizeOptionalText(values.description ?? '') ?? null,
  sortOrder: values.sortOrder,
  isActive: values.isActive,
})

export const CollectionChannelTypesPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('collection_channels.read')
  const canUpdate = hasPermission('collection_channels.update')
  const { items, isLoading, error, refresh } = useCollectionChannelTypes({ enabled: canRead })
  const mutations = useCollectionChannelTypeMutations()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilterValue>('all')
  const [editingItem, setEditingItem] = useState<CollectionChannelTypeResponse | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingStatusItem, setPendingStatusItem] = useState<CollectionChannelTypeResponse | null>(null)

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesTerm =
        !term ||
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term)
      const matchesStatus =
        status === 'all' ? true : status === 'active' ? item.isActive : !item.isActive
      return matchesTerm && matchesStatus
    })
  }, [items, search, status])

  const handleSubmit = async (values: CollectionChannelTypeFormValues) => {
    const payload = toPayload(values)
    if (editingItem) {
      const result = await mutations.update(editingItem.id, payload)
      if (!result.success) return
      notify('Tipo de canal actualizado correctamente.', 'success')
      setEditingItem(null)
      await refresh()
      return
    }
    const result = await mutations.create(payload)
    if (!result.success) return
    notify('Tipo de canal creado correctamente.', 'success')
    setIsCreateOpen(false)
    await refresh()
  }

  const handleToggleStatus = async () => {
    if (!pendingStatusItem) return
    const result = await mutations.toggleStatus(pendingStatusItem.id)
    if (!result.success) return
    notify(
      pendingStatusItem.isActive
        ? 'Tipo de canal desactivado correctamente.'
        : 'Tipo de canal activado correctamente.',
      'success',
    )
    setPendingStatusItem(null)
    await refresh()
  }

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Tu usuario no tiene permiso para consultar el catálogo de tipos de canal.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Tipos de canal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gestiona el catálogo persistido usado por los formularios operativos de canales.
        </p>
      </div>

      <ListFiltersBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por código, nombre o descripción..."
        status={status}
        onStatusChange={setStatus}
        actions={
          canUpdate ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => {
                mutations.setError(null)
                setEditingItem(null)
                setIsCreateOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo tipo
            </button>
          ) : null
        }
      />

      <CollectionChannelTypesTable
        items={filteredItems}
        isLoading={isLoading || isLoadingPermissions}
        error={error}
        canUpdate={canUpdate}
        onEdit={(item) => {
          mutations.setError(null)
          setIsCreateOpen(false)
          setEditingItem(item)
        }}
        onToggleStatus={setPendingStatusItem}
      />

      <CollectionChannelTypeFormModal
        open={isCreateOpen || Boolean(editingItem)}
        channelType={editingItem}
        isSaving={mutations.isSaving}
        error={mutations.error}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingItem(null)
          mutations.setError(null)
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(pendingStatusItem)}
        title={pendingStatusItem?.isActive ? 'Desactivar tipo de canal' : 'Activar tipo de canal'}
        description={
          pendingStatusItem?.isActive
            ? 'Si desactivas este tipo, ya no debe aparecer como opción seleccionable en formularios operativos.'
            : '¿Deseas activar nuevamente este tipo de canal?'
        }
        confirmLabel={pendingStatusItem?.isActive ? 'Desactivar' : 'Activar'}
        isProcessing={mutations.isTogglingStatus}
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
