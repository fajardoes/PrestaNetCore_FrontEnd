export interface HolidayTypeItemDto {
  id: string | number
  code: string
  name: string
  description?: string | null
  sortOrder: number
  isActive: boolean
}
