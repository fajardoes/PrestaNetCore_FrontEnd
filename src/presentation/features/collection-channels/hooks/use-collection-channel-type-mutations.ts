import { useCallback, useState } from 'react'
import { createCollectionChannelTypeAction } from '@/core/actions/collection-channels/create-collection-channel-type.action'
import { updateCollectionChannelTypeAction } from '@/core/actions/collection-channels/update-collection-channel-type.action'
import { updateCollectionChannelTypeStatusAction } from '@/core/actions/collection-channels/update-collection-channel-type-status.action'
import type { UpsertCollectionChannelTypeRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-type-request'

export const useCollectionChannelTypeMutations = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = useCallback(async (payload: UpsertCollectionChannelTypeRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await createCollectionChannelTypeAction(payload)
    setIsSaving(false)
    if (!result.success) setError(result.error)
    return result
  }, [])

  const update = useCallback(async (channelTypeId: string, payload: UpsertCollectionChannelTypeRequest) => {
    setIsSaving(true)
    setError(null)
    const result = await updateCollectionChannelTypeAction(channelTypeId, payload)
    setIsSaving(false)
    if (!result.success) setError(result.error)
    return result
  }, [])

  const toggleStatus = useCallback(async (channelTypeId: string) => {
    setIsTogglingStatus(true)
    setError(null)
    const result = await updateCollectionChannelTypeStatusAction(channelTypeId)
    setIsTogglingStatus(false)
    if (!result.success) setError(result.error)
    return result
  }, [])

  return {
    isSaving,
    isTogglingStatus,
    error,
    setError,
    create,
    update,
    toggleStatus,
  }
}
