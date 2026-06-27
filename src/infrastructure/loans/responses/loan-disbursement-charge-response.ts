export interface LoanDisbursementChargeResponse {
  id?: string | null
  chargeTypeCode: string
  chargeName?: string | null
  valueTypeCode?: 'PERCENTAGE' | 'FIXED_AMOUNT' | string | null
  sourceType: string
  sourceRefId?: string | null
  chargeTimingCode: string
  baseAmount: number
  rateOrValue: number
  calculatedAmount: number
  isFinanced: boolean
  includedInNetDisbursement: boolean
}
