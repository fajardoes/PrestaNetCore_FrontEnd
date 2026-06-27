import { getCollectionChannel } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const getCollectionChannelAction = async (
  channelId: string,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await getCollectionChannel(channelId)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el canal de recaudación.')
  }
}
