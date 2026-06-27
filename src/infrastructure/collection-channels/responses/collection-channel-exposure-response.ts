export interface CollectionChannelExposureResponse {
  channelId: string
  code: string
  name: string
  isActive: boolean
  currencyCode: string
  currentOutstandingAmount: number
  maxOutstandingAmount: number
  availableOutstandingAmount: number
  utilizationPercentage: number
  activeUsersCount: number
}
