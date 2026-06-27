export interface ListCollectionChannelsRequest {
  active?: boolean
  search?: string
  channelTypeCode?: string
  currencyCode?: string
  skip?: number
  take?: number
}
