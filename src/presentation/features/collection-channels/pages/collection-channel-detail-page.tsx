import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { UpdateCollectionChannelRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/collection-channel-user-response'
import type { CollectionChannelFormValues } from '@/infrastructure/validations/collection-channels/collection-channel.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { useCollectionChannelExposure } from '@/presentation/features/collection-channels/hooks/use-collection-channel-exposure'
import { useCollectionChannelAssignableUsers } from '@/presentation/features/collection-channels/hooks/use-collection-channel-assignable-users'
import { useCollectionChannelDetail } from '@/presentation/features/collection-channels/hooks/use-collection-channel-detail'
import { useCollectionChannelMutations } from '@/presentation/features/collection-channels/hooks/use-collection-channel-mutations'
import { useCollectionChannelTypes } from '@/presentation/features/collection-channels/hooks/use-collection-channel-types'
import { AssignCollectionChannelUserModal } from '@/presentation/features/collection-channels/components/assign-collection-channel-user-modal'
import { CollectionChannelDetailView } from '@/presentation/features/collection-channels/components/collection-channel-detail-view'
import { CollectionChannelFormModal } from '@/presentation/features/collection-channels/components/collection-channel-form-modal'
import { EditCollectionChannelUserLimitModal } from '@/presentation/features/collection-channels/components/edit-collection-channel-user-limit-modal'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'

const normalizeOptionalText = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

const toPayload = (values: CollectionChannelFormValues): UpdateCollectionChannelRequest => ({
  code: values.code.trim(),
  name: values.name.trim(),
  channelTypeCode: values.channelTypeCode.trim(),
  currencyCode: 'HNL',
  maxSinglePaymentAmount: values.maxSinglePaymentAmount,
  maxDailyAmount: values.maxDailyAmount,
  maxOutstandingAmount: values.maxOutstandingAmount,
  notes: normalizeOptionalText(values.notes ?? '') ?? null,
})

interface CollectionChannelDetailLocationState {
  returnTo?: string
  channel?: CollectionChannelResponse
}

export const CollectionChannelDetailPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id = '' } = useParams()
  const { notify } = useNotifications()
  const {
    hasPermission,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useUserPermissions()
  const canRead = hasPermission('collection_channels.read')
  const canUpdate = hasPermission('collection_channels.update')
  const canManageUsers = hasPermission('collection_channels.manage_users')

  const detail = useCollectionChannelDetail()
  const exposure = useCollectionChannelExposure()
  const mutations = useCollectionChannelMutations()
  const channelTypesCatalog = useCollectionChannelTypes({ enabled: canRead, activeOnly: false })
  const activeChannelTypes = useCollectionChannelTypes({ enabled: canRead, activeOnly: true })
  const assignableUsers = useCollectionChannelAssignableUsers(canManageUsers)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [editingUserLimit, setEditingUserLimit] = useState<CollectionChannelUserResponse | null>(null)

  const navigationState = (location.state as CollectionChannelDetailLocationState | null) ?? null
  const returnTo = navigationState?.returnTo ?? '/collection-channels'
  const { load: loadDetail, setChannel } = detail
  const { load: loadExposure, clear: clearExposure } = exposure

  const reloadDetail = async () => {
    if (!id) return null

    const detailResult = await loadDetail(id)
    if (!detailResult.success) {
      return null
    }

    setChannel(detailResult.data)
    await loadExposure(detailResult.data.id)
    return detailResult.data
  }

  useEffect(() => {
    if (!id || !canRead) return
    const fallbackChannel = navigationState?.channel?.id === id ? navigationState.channel : null
    if (fallbackChannel) {
      setChannel(fallbackChannel)
    }

    const run = async () => {
      const result = await loadDetail(id)
      if (!result.success && fallbackChannel) {
        setChannel(fallbackChannel)
      }
    }

    void run()
  }, [canRead, id, loadDetail, navigationState?.channel, setChannel])

  useEffect(() => {
    if (!detail.channel?.id) {
      clearExposure()
      return
    }
    void loadExposure(detail.channel.id)
  }, [clearExposure, detail.channel?.id, loadExposure])

  const syncChannel = async (nextChannel: CollectionChannelResponse, refreshUsers = false) => {
    setChannel(nextChannel)
    await loadExposure(nextChannel.id)
    if (refreshUsers) {
      await assignableUsers.refresh()
    }
  }

  const handleUpdate = async (values: CollectionChannelFormValues) => {
    if (!detail.channel) return
    const result = await mutations.updateChannel(detail.channel.id, toPayload(values))
    if (!result.success) return
    notify('Canal actualizado correctamente.', 'success')
    setIsEditOpen(false)
    mutations.setFormError(null)
    const refreshed = await reloadDetail()
    if (!refreshed) {
      await syncChannel(result.data)
    }
  }

  const handleAssignUser = async (userId: string, maxOutstandingAmount: number) => {
    if (!detail.channel) return
    const result = await mutations.assignUser(detail.channel.id, userId, maxOutstandingAmount)
    if (!result.success) return
    notify('Usuario asignado correctamente.', 'success')
    setIsAssignOpen(false)
    mutations.setAssignError(null)
    const refreshed = await reloadDetail()
    if (!refreshed) {
      await syncChannel(result.data, true)
      return
    }
    await assignableUsers.refresh()
  }

  const handleRemoveUser = async (channel: CollectionChannelResponse, userId: string) => {
    const result = await mutations.removeUser(channel.id, userId)
    if (!result.success) return
    notify('Usuario removido del canal.', 'success')
    mutations.setRemoveError(null)
    const refreshed = await reloadDetail()
    if (!refreshed) {
      await syncChannel(result.data, true)
      return
    }
    await assignableUsers.refresh()
  }

  const handleUpdateUserLimit = async (maxOutstandingAmount: number) => {
    if (!detail.channel || !editingUserLimit) return
    const result = await mutations.updateUserOutstandingLimit(detail.channel.id, editingUserLimit.userId, {
      maxOutstandingAmount,
    })
    if (!result.success) return
    notify('Límite máximo de saldo pendiente del usuario actualizado correctamente.', 'success')
    mutations.setUpdateUserLimitError(null)
    setEditingUserLimit(null)
    const refreshed = await reloadDetail()
    if (!refreshed) {
      await syncChannel(result.data)
    }
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

  if (!id) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100">
        No se recibió el identificador del canal.
      </div>
    )
  }

  if (detail.isLoading && !detail.channel) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando canal...</p>
  }

  if (!detail.channel) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100">
          {detail.error ?? 'No se encontró el canal.'}
        </div>
        <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => navigate(returnTo)}>
          Volver a canales
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {permissionsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {permissionsError}
          </div>
        ) : null}

        {detail.error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100">
            {detail.error}
          </div>
        ) : null}

        {canManageUsers && assignableUsers.error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100">
            {assignableUsers.error}
          </div>
        ) : null}

        <CollectionChannelDetailView
          channel={detail.channel}
          exposure={exposure.data}
          isExposureLoading={exposure.isLoading}
          exposureError={exposure.error}
          channelTypes={channelTypesCatalog.rawItems}
          canUpdate={canUpdate}
          canManageUsers={canManageUsers}
          removingUserId={mutations.removingUserId}
          removeError={mutations.removeError}
          updatingUserLimitId={mutations.updatingUserLimitId}
          updateUserLimitError={mutations.updateUserLimitError}
          onBack={() => navigate(returnTo)}
          onEdit={(channel) => {
            mutations.setFormError(null)
            setChannel(channel)
            setIsEditOpen(true)
          }}
          onAssignUser={(channel) => {
            mutations.setAssignError(null)
            setChannel(channel)
            setIsAssignOpen(true)
          }}
          onEditUserLimit={(user) => {
            mutations.setUpdateUserLimitError(null)
            setEditingUserLimit(user)
          }}
          onRemoveUser={handleRemoveUser}
        />
      </div>

      <CollectionChannelFormModal
        open={isEditOpen}
        channel={detail.channel}
        channelTypes={activeChannelTypes.items}
        isSaving={mutations.isSavingForm}
        error={mutations.formError ?? activeChannelTypes.error}
        onClose={() => {
          setIsEditOpen(false)
          mutations.setFormError(null)
        }}
        onSubmit={handleUpdate}
      />

      <AssignCollectionChannelUserModal
        open={isAssignOpen}
        users={assignableUsers.users}
        loadUsers={assignableUsers.searchUsers}
        isLoadingUsers={assignableUsers.isLoading}
        isAssigning={mutations.isAssigning}
        error={mutations.assignError ?? assignableUsers.error}
        onClose={() => {
          setIsAssignOpen(false)
          mutations.setAssignError(null)
        }}
        onSubmit={handleAssignUser}
      />

      <EditCollectionChannelUserLimitModal
        open={Boolean(editingUserLimit)}
        user={editingUserLimit}
        currencyCode={detail.channel.currencyCode}
        isSaving={mutations.isUpdatingUserLimit}
        error={mutations.updateUserLimitError}
        onClose={() => {
          setEditingUserLimit(null)
          mutations.setUpdateUserLimitError(null)
        }}
        onSubmit={handleUpdateUserLimit}
      />
    </>
  )
}
