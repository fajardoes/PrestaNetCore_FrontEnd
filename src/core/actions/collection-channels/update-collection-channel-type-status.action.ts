import { updateCollectionChannelTypeStatus } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'

export const updateCollectionChannelTypeStatusAction = async (
  channelTypeId: string,
): Promise<ApiResult<CollectionChannelTypeResponse>> => {
  try {
    const data = await updateCollectionChannelTypeStatus(channelTypeId)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible cambiar el estado del tipo de canal.')
  }
}
