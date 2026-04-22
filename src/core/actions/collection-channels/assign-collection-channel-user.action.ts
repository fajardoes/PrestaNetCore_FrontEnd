import { assignUserToCollectionChannel } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AssignCollectionChannelUserRequest } from '@/infrastructure/collection-channels/requests/assign-collection-channel-user-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

export const assignCollectionChannelUserAction = async (
  channelId: string,
  payload: AssignCollectionChannelUserRequest,
): Promise<ApiResult<CollectionChannelResponse>> => {
  try {
    const data = await assignUserToCollectionChannel(channelId, payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible asignar el usuario al canal.')
  }
}
