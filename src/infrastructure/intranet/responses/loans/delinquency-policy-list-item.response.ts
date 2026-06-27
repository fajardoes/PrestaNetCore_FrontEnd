export interface DelinquencyPolicyListItemDto {
  id: string
  code: string
  name: string
  isActive: boolean
  graceDays: number
  penaltyRateAnnual: number
  rateBaseId?: string | null
  rateBaseCode?: string | null
  rateBaseName?: string | null
  rateBase: number
  calculationBaseId?: string | null
  calculationBaseCode?: string | null
  calculationBaseName?: string | null
  calculationBase?: string | null
  roundingModeId?: string | null
  roundingModeCode?: string | null
  roundingModeName?: string | null
  roundingMode?: string | null
}
