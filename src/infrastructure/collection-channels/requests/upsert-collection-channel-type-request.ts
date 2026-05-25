export interface UpsertCollectionChannelTypeRequest {
  code: string
  name: string
  description?: string | null
  sortOrder: number
  isActive: boolean
}
