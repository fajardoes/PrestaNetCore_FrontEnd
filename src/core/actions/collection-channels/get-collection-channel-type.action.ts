import { getCollectionChannelType } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'

export const getCollectionChannelTypeAction = async (
  channelTypeId: string,
): Promise<ApiResult<CollectionChannelTypeResponse>> => {
  try {
    const data = await getCollectionChannelType(channelTypeId)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible cargar el tipo de canal.')
  }
}
