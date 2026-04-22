import { removeUserFromCollectionChannel } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const removeCollectionChannelUserAction = async (
  channelId: string,
  userId: string,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await removeUserFromCollectionChannel(channelId, userId)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible remover el usuario del canal.')
  }
}
