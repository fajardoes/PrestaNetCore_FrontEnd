import { deactivateCollectionChannel } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const deactivateCollectionChannelAction = async (
  channelId: string,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await deactivateCollectionChannel(channelId)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible desactivar el canal de recaudación.')
  }
}
