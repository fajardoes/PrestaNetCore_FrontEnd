export interface HolidayListItemDto {
  id: string
  date: string
  name: string
  description?: string | null
  holidayTypeId: string | number
  holidayTypeCode: string
  holidayTypeName: string
  isActive: boolean
}
