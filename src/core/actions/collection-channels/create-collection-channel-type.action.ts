import { createCollectionChannelType } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpsertCollectionChannelTypeRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-type-request'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'

export const createCollectionChannelTypeAction = async (
  payload: UpsertCollectionChannelTypeRequest,
): Promise<ApiResult<CollectionChannelTypeResponse>> => {
  try {
    const data = await createCollectionChannelType(payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible crear el tipo de canal.')
  }
}
