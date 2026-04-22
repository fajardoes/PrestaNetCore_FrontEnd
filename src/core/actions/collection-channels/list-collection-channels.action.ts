import { listCollectionChannels } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ListCollectionChannelsRequest } from '@/infrastructure/collection-channels/requests/list-collection-channels-request'
import type { ListCollectionChannelsResponse } from '@/infrastructure/collection-channels/responses/list-collection-channels-response'

export const listCollectionChannelsAction = async (
  params: ListCollectionChannelsRequest,
): Promise<ApiResult<ListCollectionChannelsResponse>> => {
  try {
    const data = await listCollectionChannels(params)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible cargar los canales de recaudación.')
  }
}
