import { createCollectionChannel } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CreateCollectionChannelRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const createCollectionChannelAction = async (
  payload: CreateCollectionChannelRequest,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await createCollectionChannel(payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible crear el canal de recaudación.')
  }
}
