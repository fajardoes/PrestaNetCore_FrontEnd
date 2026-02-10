export interface IsBusinessDayResponseDto {
  date: string
  isBusinessDay: boolean
  reason: string
  holidayName?: string | null
}
