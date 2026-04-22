import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { CreateCollectionChannelRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-request'
import type { ListCollectionChannelsRequest } from '@/infrastructure/collection-channels/requests/list-collection-channels-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelFormValues } from '@/infrastructure/validations/collection-channels/collection-channel.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { useCollectionChannelMutations } from '@/presentation/features/collection-channels/hooks/use-collection-channel-mutations'
import { useCollectionChannelTypes } from '@/presentation/features/collection-channels/hooks/use-collection-channel-types'
import { useCollectionChannelsList } from '@/presentation/features/collection-channels/hooks/use-collection-channels-list'
import { CollectionChannelFormModal } from '@/presentation/features/collection-channels/components/collection-channel-form-modal'
import { CollectionChannelsTable } from '@/presentation/features/collection-channels/components/collection-channels-table'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import SelectField from '@/presentation/share/components/select'
import { toChannelTypeLabel } from '@/presentation/features/collection-channels/components/collection-channel-ui'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const toCreatePayload = (values: CollectionChannelFormValues): CreateCollectionChannelRequest => ({
  code: values.code.trim(),
  name: values.name.trim(),
  channelTypeCode: values.channelTypeCode.trim(),
  currencyCode: 'HNL',
  maxSinglePaymentAmount: values.maxSinglePaymentAmount,
  maxDailyAmount: values.maxDailyAmount,
  maxOutstandingAmount: values.maxOutstandingAmount,
  notes: normalizeOptionalText(values.notes ?? '') ?? null,
})

const toUpdatePayload = (values: CollectionChannelFormValues) => ({
  ...toCreatePayload(values),
  maxOutstandingAmount: values.maxOutstandingAmount,
})

export const CollectionChannelsPage = () => {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const {
    hasPermission,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useUserPermissions()
  const canRead = hasPermission('collection_channels.read')
  const canCreate = hasPermission('collection_channels.create')
  const canUpdate = hasPermission('collection_channels.update')
  const canManageUsers = hasPermission('collection_channels.manage_users')

  const {
    items,
    totalCount,
    page,
    take,
    totalPages,
    isLoading,
    error,
    filters,
    applyFilters,
    setPage,
    setTake,
    refresh,
  } = useCollectionChannelsList({ enabled: canRead })
  const channelTypesCatalog = useCollectionChannelTypes({ enabled: canRead, activeOnly: false })
  const activeChannelTypes = useCollectionChannelTypes({ enabled: canRead, activeOnly: true })
  const mutations = useCollectionChannelMutations()

  const [search, setSearch] = useState(filters.search ?? '')
  const [status, setStatus] = useState<StatusFilterValue>(
    filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive',
  )
  const [channelTypeCode, setChannelTypeCode] = useState(filters.channelTypeCode ?? '')
  const [editingChannel, setEditingChannel] = useState<CollectionChannelResponse | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingDeactivate, setPendingDeactivate] = useState<CollectionChannelResponse | null>(null)

  const typeOptions = useMemo(() => {
    const values = new Set(channelTypesCatalog.rawItems.map((item) => item.code).filter(Boolean))
    items.map((item) => item.channelTypeCode).filter(Boolean).forEach((value) => values.add(value))
    if (channelTypeCode) values.add(channelTypeCode)
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [channelTypeCode, channelTypesCatalog.rawItems, items])

  const channelTypeSelectOptions = useMemo(
    () =>
      typeOptions.map((option) => ({
        value: option,
        label: toChannelTypeLabel(option, channelTypesCatalog.rawItems),
      })),
    [channelTypesCatalog.rawItems, typeOptions],
  )

  const visibleSummary = useMemo(() => {
    const activeCount = items.filter((item) => item.isActive).length
    const exceededCount = items.filter((item) => item.isLimitExceeded).length
    return {
      activeCount,
      inactiveCount: items.length - activeCount,
      exceededCount,
    }
  }, [items])

  const reloadVisibleData = async () => {
    await refresh()
  }

  const handleApplyFilters = () => {
    const nextFilters: Omit<ListCollectionChannelsRequest, 'skip' | 'take'> = {
      search: normalizeOptionalText(search),
      channelTypeCode: normalizeOptionalText(channelTypeCode),
      active: status === 'all' ? undefined : status === 'active',
    }
    applyFilters(nextFilters)
  }

  const resetFilters = () => {
    setSearch('')
    setStatus('active')
    setChannelTypeCode('')
    applyFilters({
      search: undefined,
      channelTypeCode: undefined,
      active: true,
    })
  }

  const handleSubmitForm = async (values: CollectionChannelFormValues) => {
    if (editingChannel) {
      const result = await mutations.updateChannel(editingChannel.id, toUpdatePayload(values))
      if (!result.success) return
      notify('Canal actualizado correctamente.', 'success')
      setEditingChannel(null)
      await reloadVisibleData()
      return
    }

    const result = await mutations.createChannel(toCreatePayload(values))
    if (!result.success) return
    notify('Canal creado correctamente.', 'success')
    setIsCreateOpen(false)
    await reloadVisibleData()
  }

  const handleDeactivate = async () => {
    if (!pendingDeactivate) return
    const result = await mutations.deactivateChannel(pendingDeactivate.id)
    if (!result.success) return
    notify('Canal desactivado correctamente.', 'success')
    setPendingDeactivate(null)
    await reloadVisibleData()
  }

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para consultar canales de recaudación.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Canales de recaudación
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Administración de canales operativos y límites de saldo pendiente.
          </p>
          {permissionsError ? (
            <p className="mt-2 text-xs text-red-500">{permissionsError}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 pb-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-200">
            {items.length} canales visibles
          </span>
          <span>{totalCount} registros totales</span>
          <span>{visibleSummary.activeCount} activos</span>
          <span>{visibleSummary.inactiveCount} inactivos</span>
          <span
            className={
              visibleSummary.exceededCount > 0
                ? 'font-medium text-red-600 dark:text-red-300'
                : ''
            }
          >
            {visibleSummary.exceededCount} con exceso
          </span>
        </div>
        <ListFiltersBar
          layout="two-rows"
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          placeholder="Buscar por código o nombre..."
          actions={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button type="button" className="btn-secondary px-3 py-2 text-sm" onClick={resetFilters}>
                Limpiar filtros
              </button>
              <button type="button" className="btn-primary px-3 py-2 text-sm" onClick={handleApplyFilters}>
                Buscar
              </button>
              {canCreate ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm"
                  onClick={() => {
                    mutations.setFormError(null)
                    setEditingChannel(null)
                    setIsCreateOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Nuevo canal
                </button>
              ) : null}
              {canUpdate ? (
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-sm"
                  onClick={() => navigate('/collection-channels/channel-types')}
                >
                  Tipos de canal
                </button>
              ) : null}
            </div>
          }
        >
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tipo de canal
              </label>
              <SelectField
                inputId="collection-channels-filter-channel-type"
                instanceId="collection-channels-filter-channel-type"
                value={
                  channelTypeSelectOptions.find((option) => option.value === channelTypeCode) ??
                  null
                }
                onChange={(option) => setChannelTypeCode(option?.value ?? '')}
                options={channelTypeSelectOptions}
                placeholder="Todos"
                isClearable
                noOptionsMessage="Sin tipos de canal"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Registros por página
              </label>
              <select
                className="h-[38px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                value={take}
                onChange={(event) => setTake(Number(event.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} por página
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ListFiltersBar>
      </div>

      <CollectionChannelsTable
        items={items}
        isLoading={isLoading || isLoadingPermissions || channelTypesCatalog.isLoading}
        error={error ?? channelTypesCatalog.error}
        page={page}
        totalPages={totalPages}
        channelTypes={channelTypesCatalog.rawItems}
        onPageChange={setPage}
        canUpdate={canUpdate}
        canManageUsers={canManageUsers}
        onView={(channel) =>
          navigate(`/collection-channels/${channel.id}`, {
            state: { returnTo: '/collection-channels', channel },
          })
        }
        onEdit={(channel) => {
          mutations.setFormError(null)
          setIsCreateOpen(false)
          setEditingChannel(channel)
        }}
        onDeactivate={setPendingDeactivate}
        onManageUsers={(channel) =>
          navigate(`/collection-channels/${channel.id}`, {
            state: { returnTo: '/collection-channels', channel },
          })
        }
      />

      <CollectionChannelFormModal
        open={isCreateOpen || Boolean(editingChannel)}
        channel={editingChannel}
        channelTypes={activeChannelTypes.items}
        isSaving={mutations.isSavingForm}
        error={mutations.formError ?? activeChannelTypes.error}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingChannel(null)
          mutations.setFormError(null)
        }}
        onSubmit={handleSubmitForm}
      />

      <ConfirmModal
        open={Boolean(pendingDeactivate)}
        title="¿Deseas desactivar este canal?"
        description={
          pendingDeactivate?.currentOutstandingAmount && pendingDeactivate.currentOutstandingAmount > 0
            ? 'Este canal tiene saldo pendiente. El backend validará si la desactivación es permitida.'
            : 'Los usuarios activos asignados a este canal también serán desactivados del canal.'
        }
        confirmLabel="Desactivar canal"
        isProcessing={mutations.isDeactivating}
        onCancel={() => {
          setPendingDeactivate(null)
          mutations.setDeactivateError(null)
        }}
        onConfirm={() => void handleDeactivate()}
      >
        {mutations.deactivateError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {mutations.deactivateError}
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
