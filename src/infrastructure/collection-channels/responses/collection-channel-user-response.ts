export interface CollectionChannelUserResponse {
  id: string
  userId: string
  userName: string
  email: string
  isActive: boolean
  maxOutstandingAmount: number
  currentOutstandingAmount: number
  availableOutstandingAmount: number
  isLimitExceeded: boolean
  assignedAt: string
}
