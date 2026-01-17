import type { DelinquencyBucketDto } from '@/infrastructure/intranet/responses/loans/delinquency-bucket.response'

export interface UpdateDelinquencyPolicyRequestDto {
  code: string
  name: string
  description?: string | null
  graceDays: number
  penaltyRateAnnual: number
  rateBase: number
  calculationBase: string
  roundingMode: string
  roundingDecimals: number
  minimumPenaltyAmount: number
  maximumPenaltyAmount?: number | null
  includeSaturday: boolean
  includeSunday: boolean
  buckets: DelinquencyBucketDto[]
}
