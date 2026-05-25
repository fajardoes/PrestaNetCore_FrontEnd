import { listCollectionChannelTypes } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'

export const listCollectionChannelTypesAction = async (): Promise<
  ApiResult<CollectionChannelTypeResponse[]>
> => {
  try {
    const data = await listCollectionChannelTypes()
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible cargar los tipos de canal.')
  }
}
