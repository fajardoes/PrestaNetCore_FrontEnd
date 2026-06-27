import { getCollectionChannelExposure } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelExposureResponse } from '@/infrastructure/collection-channels/responses/collection-channel-exposure-response'

export const getCollectionChannelExposureAction = async (
  channelId: string,
): Promise<ApiResult<CollectionChannelExposureResponse>> => {
  try {
    const data = await getCollectionChannelExposure(channelId)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar la exposición del canal.')
  }
}
