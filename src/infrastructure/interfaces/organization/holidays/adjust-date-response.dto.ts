import type { BusinessDayAdjustmentRule } from './business-day-adjustment-rule'

export interface AdjustDateResponseDto {
  originalDate: string
  adjustedDate: string
  rule: BusinessDayAdjustmentRule
  shiftDays: number
}
