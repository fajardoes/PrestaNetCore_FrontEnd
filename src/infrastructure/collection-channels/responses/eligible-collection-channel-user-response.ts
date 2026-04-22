export interface EligibleCollectionChannelUserResponse {
  userId: string
  userName: string
  email: string
  agencyId: string | null
  agencyName?: string | null
  hasOperatePermission: boolean
  hasActiveChannelAssignment: boolean
  currentChannelId: string | null
  currentChannelCode: string | null
  currentChannelName: string | null
}
