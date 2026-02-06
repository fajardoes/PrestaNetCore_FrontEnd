export interface HolidayListItemDto {
  id: string
  date: string
  name: string
  description?: string | null
  type: number
  isActive: boolean
}
