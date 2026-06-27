export type LoanDisbursementReversalPostingMode = 'SYSTEM_REVERSAL' | string

export interface LoanDisbursementReversalEligibilityResponse {
  loanId: string
  loanNumber?: string | null
  isEligible: boolean
  blockingReasons: string[]
  warnings: string[]
  recommendedAction?: string | null
  businessDate?: string | null
  originalDisbursementDate?: string | null
  requiresAdjustmentPosting: boolean
  allowedPostingModes: LoanDisbursementReversalPostingMode[]
  hasPayments: boolean
  hasDependentTransactions: boolean
  hasAccrualsRecognized: boolean
  hasDeferredChargesRecognized: boolean
}
