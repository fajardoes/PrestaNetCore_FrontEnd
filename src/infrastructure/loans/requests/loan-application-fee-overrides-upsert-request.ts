export type LoanApplicationFeeOverrideUpsertMode = 'MODIFIED' | 'REMOVED'

export interface LoanApplicationFeeOverrideUpsertItemRequest {
  loanProductFeeId: string
  overrideMode: LoanApplicationFeeOverrideUpsertMode
  overrideValue?: number | null
  overrideReason: string
}

export interface LoanApplicationFeeOverridesUpsertRequest {
  items: LoanApplicationFeeOverrideUpsertItemRequest[]
}
