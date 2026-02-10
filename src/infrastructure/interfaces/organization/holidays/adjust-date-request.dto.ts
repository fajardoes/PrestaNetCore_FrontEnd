import type { BusinessDayAdjustmentRule } from './business-day-adjustment-rule'

export interface AdjustDateRequestDto {
  date: string
  rule: BusinessDayAdjustmentRule
  agencyId?: string | null
  portfolioTypeId?: string | null
}
