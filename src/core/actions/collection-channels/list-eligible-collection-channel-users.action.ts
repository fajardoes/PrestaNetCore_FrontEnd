import { listEligibleCollectionChannelUsers } from '@/core/api/collection-channels/collection-channels-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ListEligibleCollectionChannelUsersRequest } from '@/infrastructure/collection-channels/requests/list-eligible-collection-channel-users-request'
import type { EligibleCollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/eligible-collection-channel-user-response'

export const listEligibleCollectionChannelUsersAction = async (
  params: ListEligibleCollectionChannelUsersRequest,
): Promise<ApiResult<EligibleCollectionChannelUserResponse[]>> => {
  try {
    const data = await listEligibleCollectionChannelUsers(params)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener usuarios elegibles para el canal.')
  }
}
