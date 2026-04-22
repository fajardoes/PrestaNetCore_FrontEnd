import { updateCollectionChannel } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateCollectionChannelRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const updateCollectionChannelAction = async (
  channelId: string,
  payload: UpdateCollectionChannelRequest,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await updateCollectionChannel(channelId, payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el canal de recaudación.')
  }
}
