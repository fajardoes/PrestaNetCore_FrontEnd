export interface HolidayCreateDto {
  date: string
  name: string
  description?: string | null
  holidayTypeId: string | number
  isActive: boolean
}
