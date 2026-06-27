export interface HolidayUpdateDto {
  date: string
  name: string
  description?: string | null
  holidayTypeId: string | number
  isActive: boolean
}
