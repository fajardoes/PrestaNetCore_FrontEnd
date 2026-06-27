import { useCallback, useEffect, useState } from 'react'
import { getCollectionTransitAccountSettingAction } from '@/core/actions/system/get-collection-transit-account-setting.action'
import { updateCollectionTransitAccountSettingAction } from '@/core/actions/system/update-collection-transit-account-setting.action'
import type { CollectionTransitAccountSettingDto } from '@/infrastructure/interfaces/system/collection-transit-account-setting.dto'

export const useCollectionTransitAccount = (enabled = true) => {
  const [state, setState] = useState<CollectionTransitAccountSettingDto | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setState(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)
    const result = await getCollectionTransitAccountSettingAction()
    if (result.success) {
      setState(result.data)
      setIsLoading(false)
      return
    }

    setError(result.error)
    setIsLoading(false)
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateSetting = useCallback(
    async (collectionTransitGlAccountId: string | null) => {
      if (!enabled) return false
      setIsSaving(true)
      setError(null)

      const result = await updateCollectionTransitAccountSettingAction({
        collectionTransitGlAccountId,
      })

      setIsSaving(false)

      if (!result.success) {
        setError(result.error)
        return false
      }

      setState(result.data)
      return true
    },
    [enabled],
  )

  return {
    state,
    isLoading,
    isSaving,
    error,
    refresh,
    updateSetting,
  }
}
