import { httpClient } from '@/infrastructure/api/httpClient'
import type { AssignCollectionChannelUserRequest } from '@/infrastructure/collection-channels/requests/assign-collection-channel-user-request'
import type { ListEligibleCollectionChannelUsersRequest } from '@/infrastructure/collection-channels/requests/list-eligible-collection-channel-users-request'
import type { ListCollectionChannelsRequest } from '@/infrastructure/collection-channels/requests/list-collection-channels-request'
import type { UpdateCollectionChannelUserOutstandingLimitRequest } from '@/infrastructure/collection-channels/requests/update-collection-channel-user-outstanding-limit-request'
import type {
  CreateCollectionChannelRequest,
  UpdateCollectionChannelRequest,
} from '@/infrastructure/collection-channels/requests/upsert-collection-channel-request'
import type { EligibleCollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/eligible-collection-channel-user-response'
import type { UpsertCollectionChannelTypeRequest } from '@/infrastructure/collection-channels/requests/upsert-collection-channel-type-request'
import type { CollectionChannelExposureResponse } from '@/infrastructure/collection-channels/responses/collection-channel-exposure-response'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import type { ListCollectionChannelsResponse } from '@/infrastructure/collection-channels/responses/list-collection-channels-response'

const basePath = '/collection-channels'

export const listCollectionChannels = async (
  params: ListCollectionChannelsRequest,
): Promise<ListCollectionChannelsResponse> => {
  const { data } = await httpClient.get<ListCollectionChannelsResponse>(basePath, {
    params,
  })
  return data
}

export const createCollectionChannel = async (
  payload: CreateCollectionChannelRequest,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.post<CollectionChannelResponse>(basePath, payload)
  return data
}

export const getCollectionChannel = async (
  channelId: string,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.get<CollectionChannelResponse>(`${basePath}/${channelId}`)
  return data
}

export const updateCollectionChannel = async (
  channelId: string,
  payload: UpdateCollectionChannelRequest,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.put<CollectionChannelResponse>(
    `${basePath}/${channelId}`,
    payload,
  )
  return data
}

export const deactivateCollectionChannel = async (
  channelId: string,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.patch<CollectionChannelResponse>(
    `${basePath}/${channelId}/deactivate`,
  )
  return data
}

export const assignUserToCollectionChannel = async (
  channelId: string,
  payload: AssignCollectionChannelUserRequest,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.post<CollectionChannelResponse>(
    `${basePath}/${channelId}/assign-user`,
    payload,
  )
  return data
}

export const listEligibleCollectionChannelUsers = async (
  params: ListEligibleCollectionChannelUsersRequest,
): Promise<EligibleCollectionChannelUserResponse[]> => {
  const { data } = await httpClient.get<EligibleCollectionChannelUserResponse[]>(
    `${basePath}/eligible-users`,
    { params },
  )
  return data
}

export const removeUserFromCollectionChannel = async (
  channelId: string,
  userId: string,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.delete<CollectionChannelResponse>(
    `${basePath}/${channelId}/remove-user`,
    { params: { userId } },
  )
  return data
}

export const updateCollectionChannelUserOutstandingLimit = async (
  channelId: string,
  userId: string,
  payload: UpdateCollectionChannelUserOutstandingLimitRequest,
): Promise<CollectionChannelResponse> => {
  const { data } = await httpClient.put<CollectionChannelResponse>(
    `${basePath}/${channelId}/users/${userId}/outstanding-limit`,
    payload,
  )
  return data
}

export const getCollectionChannelExposure = async (
  channelId: string,
): Promise<CollectionChannelExposureResponse> => {
  const { data } = await httpClient.get<CollectionChannelExposureResponse>(
    `${basePath}/${channelId}/exposure`,
  )
  return data
}

const channelTypesBasePath = `${basePath}/catalogs/channel-types`

export const listCollectionChannelTypes = async (): Promise<CollectionChannelTypeResponse[]> => {
  const { data } = await httpClient.get<CollectionChannelTypeResponse[]>(channelTypesBasePath)
  return data
}

export const getCollectionChannelType = async (
  channelTypeId: string,
): Promise<CollectionChannelTypeResponse> => {
  const { data } = await httpClient.get<CollectionChannelTypeResponse>(
    `${channelTypesBasePath}/${channelTypeId}`,
  )
  return data
}

export const createCollectionChannelType = async (
  payload: UpsertCollectionChannelTypeRequest,
): Promise<CollectionChannelTypeResponse> => {
  const { data } = await httpClient.post<CollectionChannelTypeResponse>(
    channelTypesBasePath,
    payload,
  )
  return data
}

export const updateCollectionChannelType = async (
  channelTypeId: string,
  payload: UpsertCollectionChannelTypeRequest,
): Promise<CollectionChannelTypeResponse> => {
  const { data } = await httpClient.put<CollectionChannelTypeResponse>(
    `${channelTypesBasePath}/${channelTypeId}`,
    payload,
  )
  return data
}

export const updateCollectionChannelTypeStatus = async (
  channelTypeId: string,
): Promise<CollectionChannelTypeResponse> => {
  const { data } = await httpClient.patch<CollectionChannelTypeResponse>(
    `${channelTypesBasePath}/${channelTypeId}/status`,
  )
  return data
}
