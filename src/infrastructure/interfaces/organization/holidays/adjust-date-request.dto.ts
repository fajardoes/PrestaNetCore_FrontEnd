import type { BusinessDayAdjustmentRuleCode } from './business-day-adjustment-rule'

export interface AdjustDateRequestDto {
  date: string
  holidayAdjustmentRuleCode: BusinessDayAdjustmentRuleCode
  agencyId?: string | null
  portfolioTypeId?: string | null
}
