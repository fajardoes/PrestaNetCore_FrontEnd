import { useCallback, useState } from 'react'
import { getCollectionChannelExposureAction } from '@/core/actions/collection-channels/get-collection-channel-exposure.action'
import type { CollectionChannelExposureResponse } from '@/infrastructure/collection-channels/responses/collection-channel-exposure-response'

interface ExposureState {
  data: CollectionChannelExposureResponse | null
  isLoading: boolean
  error: string | null
}

export const useCollectionChannelExposure = () => {
  const [state, setState] = useState<ExposureState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (channelId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getCollectionChannelExposureAction(channelId)
    if (result.success) {
      setState({ data: result.data, isLoading: false, error: null })
      return result
    }
    setState({ data: null, isLoading: false, error: result.error })
    return result
  }, [])

  const clear = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    load,
    clear,
  }
}
