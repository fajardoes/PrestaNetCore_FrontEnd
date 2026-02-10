export interface HolidayUpdateDto {
  date: string
  name: string
  description?: string | null
  type: number
  isActive: boolean
}
