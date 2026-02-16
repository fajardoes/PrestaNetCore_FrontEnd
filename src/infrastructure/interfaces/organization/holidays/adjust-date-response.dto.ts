import type { BusinessDayAdjustmentRuleCode } from './business-day-adjustment-rule'

export interface AdjustDateResponseDto {
  originalDate: string
  adjustedDate: string
  holidayAdjustmentRuleCode: BusinessDayAdjustmentRuleCode
  shiftDays: number
}
