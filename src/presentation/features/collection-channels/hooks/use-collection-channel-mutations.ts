import { useCallback, useState } from 'react'
import { assignCollectionChannelUserAction } from '@/core/actions/collection-channels/assign-collection-channel-user.action'
import { createCollectionChannelAction } from '@/core/actions/collection-channels/create-collection-channel.action'
import { deactivateCollectionChannelAction } from '@/core/actions/collection-channels/deactivate-collection-channel.action'
import { removeCollectionChannelUserAction } from '@/core/actions/collection-channels/remove-collection-channel-user.action'
import { updateCollectionChannelAction } from '@/core/actions/collection-channels/update-collection-channel.action'
import { updateCollectionChannelUserOutstandingLimitAction } from '@/core/actions/collection-channels/update-collection-channel-user-outstanding-limit.action'
import type { UpdateCollectionChannelUserOutstandingLimitRequest } from '@/infrastructure/collection-channels/requests/update-collection-channel-user-outstanding-limit-request'
import type {
  CreateCollectionChannelRequest,
  UpdateCollectionChannelRequest,
} from '@/infrastructure/collection-channels/requests/upsert-collection-channel-request'

export const useCollectionChannelMutations = () => {
  const [formError, setFormError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const [updateUserLimitError, setUpdateUserLimitError] = useState<string | null>(null)
  const [isSavingForm, setIsSavingForm] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isUpdatingUserLimit, setIsUpdatingUserLimit] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const [updatingUserLimitId, setUpdatingUserLimitId] = useState<string | null>(null)

  const createChannel = useCallback(async (payload: CreateCollectionChannelRequest) => {
    setIsSavingForm(true)
    setFormError(null)
    const result = await createCollectionChannelAction(payload)
    setIsSavingForm(false)
    if (!result.success) {
      setFormError(result.error)
    }
    return result
  }, [])

  const updateChannel = useCallback(
    async (channelId: string, payload: UpdateCollectionChannelRequest) => {
      setIsSavingForm(true)
      setFormError(null)
      const result = await updateCollectionChannelAction(channelId, payload)
      setIsSavingForm(false)
      if (!result.success) {
        setFormError(result.error)
      }
      return result
    },
    [],
  )

  const deactivateChannel = useCallback(async (channelId: string) => {
    setIsDeactivating(true)
    setDeactivateError(null)
    const result = await deactivateCollectionChannelAction(channelId)
    setIsDeactivating(false)
    if (!result.success) {
      setDeactivateError(result.error)
    }
    return result
  }, [])

  const assignUser = useCallback(
    async (channelId: string, userId: string, maxOutstandingAmount: number) => {
      setIsAssigning(true)
      setAssignError(null)
      const result = await assignCollectionChannelUserAction(channelId, {
        userId,
        maxOutstandingAmount,
      })
      setIsAssigning(false)
      if (!result.success) {
        setAssignError(result.error)
      }
      return result
    },
    [],
  )

  const removeUser = useCallback(async (channelId: string, userId: string) => {
    setRemovingUserId(userId)
    setRemoveError(null)
    const result = await removeCollectionChannelUserAction(channelId, userId)
    setRemovingUserId(null)
    if (!result.success) {
      setRemoveError(result.error)
    }
    return result
  }, [])

  const updateUserOutstandingLimit = useCallback(
    async (
      channelId: string,
      userId: string,
      payload: UpdateCollectionChannelUserOutstandingLimitRequest,
    ) => {
      setIsUpdatingUserLimit(true)
      setUpdatingUserLimitId(userId)
      setUpdateUserLimitError(null)
      const result = await updateCollectionChannelUserOutstandingLimitAction(
        channelId,
        userId,
        payload,
      )
      setIsUpdatingUserLimit(false)
      setUpdatingUserLimitId(null)
      if (!result.success) {
        setUpdateUserLimitError(result.error)
      }
      return result
    },
    [],
  )

  return {
    formError,
    assignError,
    deactivateError,
    removeError,
    updateUserLimitError,
    isSavingForm,
    isAssigning,
    isDeactivating,
    isUpdatingUserLimit,
    removingUserId,
    updatingUserLimitId,
    setFormError,
    setAssignError,
    setDeactivateError,
    setRemoveError,
    setUpdateUserLimitError,
    createChannel,
    updateChannel,
    deactivateChannel,
    assignUser,
    removeUser,
    updateUserOutstandingLimit,
  }
}
