import type { DelinquencyBucketDto } from '@/infrastructure/intranet/responses/loans/delinquency-bucket.response'

export interface UpdateDelinquencyPolicyRequestDto {
  code: string
  name: string
  description?: string | null
  graceDays: number
  penaltyRateAnnual: number
  rateBaseId: string
  calculationBaseId: string
  roundingModeId: string
  roundingDecimals: number
  minimumPenaltyAmount?: number | null
  maximumPenaltyAmount?: number | null
  includeSaturday: boolean
  includeSunday: boolean
  buckets: DelinquencyBucketDto[]
}
