import type { CollectionChannelResponse } from './collection-channel-response'

export interface ListCollectionChannelsResponse {
  items: CollectionChannelResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
