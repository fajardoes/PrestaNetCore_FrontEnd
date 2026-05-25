import { useCallback, useState } from 'react'
import { getCollectionChannelAction } from '@/core/actions/collection-channels/get-collection-channel.action'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

interface CollectionChannelDetailState {
  channel: CollectionChannelResponse | null
  isLoading: boolean
  error: string | null
}

export const useCollectionChannelDetail = () => {
  const [state, setState] = useState<CollectionChannelDetailState>({
    channel: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (channelId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getCollectionChannelAction(channelId)
    if (result.success) {
      setState({ channel: result.data, isLoading: false, error: null })
      return result
    }

    setState({ channel: null, isLoading: false, error: result.error })
    return result
  }, [])

  const setChannel = useCallback((channel: CollectionChannelResponse | null) => {
    setState((prev) => ({ ...prev, channel }))
  }, [])

  return {
    ...state,
    load,
    setChannel,
  }
}
