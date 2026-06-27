interface BaseCollectionChannelRequest {
  code: string
  name: string
  channelTypeCode: string
  maxSinglePaymentAmount: number
  maxDailyAmount: number
  currencyCode: string
  notes?: string | null
}

export interface CreateCollectionChannelRequest extends BaseCollectionChannelRequest {
  maxOutstandingAmount: number
}

export interface UpdateCollectionChannelRequest extends BaseCollectionChannelRequest {
  maxOutstandingAmount: number
}
