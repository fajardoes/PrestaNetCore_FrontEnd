import { updateCollectionChannelUserOutstandingLimit } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateCollectionChannelUserOutstandingLimitRequest } from '@/infrastructure/collection-channels/requests/update-collection-channel-user-outstanding-limit-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const updateCollectionChannelUserOutstandingLimitAction = async (
  channelId: string,
  userId: string,
  payload: UpdateCollectionChannelUserOutstandingLimitRequest,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await updateCollectionChannelUserOutstandingLimit(channelId, userId, payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible actualizar el límite pendiente del usuario.')
  }
}
