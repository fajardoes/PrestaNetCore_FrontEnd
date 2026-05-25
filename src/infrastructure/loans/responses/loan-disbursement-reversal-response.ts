import type { LoanDisbursementReversalPostingMode } from './loan-disbursement-reversal-eligibility-response'

export interface LoanDisbursementReversalResponse {
  loanId: string
  loanNumber?: string | null
  reversalPerformed: boolean
  reversalEventId?: string | null
  reversalJournalEntryId?: string | null
  reversalJournalEntryNumber?: string | null
  businessDate?: string | null
  postingMode?: LoanDisbursementReversalPostingMode | null
  newLoanStatus?: string | null
  message?: string | null
}
