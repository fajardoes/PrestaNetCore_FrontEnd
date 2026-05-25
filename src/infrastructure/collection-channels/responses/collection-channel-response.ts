import type { CollectionChannelUserResponse } from './collection-channel-user-response'

export interface CollectionChannelResponse {
  id: string
  code: string
  name: string
  channelTypeCode: string
  channelTypeName?: string | null
  isActive: boolean
  maxSinglePaymentAmount: number
  maxDailyAmount: number
  maxOutstandingAmount: number
  currentOutstandingAmount: number
  availableOutstandingAmount: number
  isLimitExceeded: boolean
  currencyCode: string
  notes?: string | null
  createdAt: string
  updatedAt?: string | null
  activeUsersCount: number
  users: CollectionChannelUserResponse[]
}
