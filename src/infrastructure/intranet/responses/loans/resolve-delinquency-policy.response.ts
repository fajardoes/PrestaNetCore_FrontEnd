import type { DelinquencyBucketDto } from '@/infrastructure/intranet/responses/loans/delinquency-bucket.response'

export interface ResolveDelinquencyPolicyResponseDto {
  policyId: string
  policyCode: string
  policyName: string
  graceDays: number
  penaltyRateAnnual: number
  rateBase: number
  calculationBase: string
  roundingMode: string
  roundingDecimals: number
  includeSaturday: boolean
  includeSunday: boolean
  buckets: DelinquencyBucketDto[]
}
