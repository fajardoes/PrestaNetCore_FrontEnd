import type { LoanDisbursementReversalPostingMode } from '@/infrastructure/loans/responses/loan-disbursement-reversal-eligibility-response'

export interface LoanDisbursementReversalRequest {
  reason: string
  notes?: string | null
  requestedPostingMode?: LoanDisbursementReversalPostingMode
  forceAsAdjustment?: boolean
}
