import type { DelinquencyBucketDto } from '@/infrastructure/intranet/responses/loans/delinquency-bucket.response'

export interface DelinquencyPolicyDetailDto {
  id: string
  code: string
  name: string
  description?: string | null
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
  calculationBase: string
  roundingModeId?: string | null
  roundingModeCode?: string | null
  roundingModeName?: string | null
  roundingMode: string
  roundingDecimals: number
  minimumPenaltyAmount?: number | null
  maximumPenaltyAmount?: number | null
  includeSaturday: boolean
  includeSunday: boolean
  buckets: DelinquencyBucketDto[]
}
