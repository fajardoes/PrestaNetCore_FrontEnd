export interface DelinquencyPolicyListItemDto {
  id: string
  code: string
  name: string
  isActive: boolean
  graceDays: number
  penaltyRateAnnual: number
  rateBase: number
}
