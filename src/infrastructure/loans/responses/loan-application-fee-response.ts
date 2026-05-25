export type LoanApplicationFeeOverrideMode =
  | 'INHERIT'
  | 'MODIFIED'
  | 'REMOVED'
  | string
  | null

export interface LoanApplicationFeeResponse {
  loanProductFeeId: string
  feeTypeId: string
  feeTypeName: string
  chargeBaseId: string
  chargeBaseName: string
  valueTypeId: string
  valueTypeName: string
  valueTypeCode: 'PERCENTAGE' | 'FIXED_AMOUNT' | string
  chargeTimingId: string
  chargeTimingName: string
  chargeTimingCode: 'DISBURSEMENT' | string
  productValue: number
  overrideValue?: number | null
  effectiveValue: number
  overrideMode?: LoanApplicationFeeOverrideMode
  isRemoved: boolean
  baseAmount: number
  productCalculatedAmount: number
  effectiveCalculatedAmount: number
  overrideReason?: string | null
}
