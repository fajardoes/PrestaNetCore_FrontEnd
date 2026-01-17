export interface DelinquencyBucketDto {
  id?: string | null
  code: string
  name: string
  fromDays: number
  toDays: number
  sortOrder: number
  isActive: boolean
}
