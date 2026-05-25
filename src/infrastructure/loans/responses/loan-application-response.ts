import type { LoanDisbursementChargeResponse } from './loan-disbursement-charge-response'

export interface LoanApplicationResponse {
  id: string
  applicationNo: string
  clientId: string
  clientFullName: string
  clientIdentityNo: string
  loanProductId: string
  loanProductCode: string
  loanProductName: string
  promoterId: string
  promoterCode?: string | null
  promoterClientFullName: string
  statusId: string
  statusCode: string
  statusName: string
  requestedPrincipal: number
  requestedTerm: number
  requestedPaymentFrequencyId: string
  requestedPaymentFrequencyCode: string
  requestedPaymentFrequencyName: string
  suggestedPaymentFrequencyId?: string | null
  suggestedPaymentFrequencyCode?: string | null
  suggestedPaymentFrequencyName?: string | null
  requestedRateOverride?: number | null
  notes?: string | null
  createdOperationalDate: string
  submittedOperationalDate?: string | null
  approvedOperationalDate?: string | null
  disbursedOperationalDate?: string | null
  rejectedOperationalDate?: string | null
  cancelledOperationalDate?: string | null
  returnedToDraftOperationalDate?: string | null
  rejectedReason?: string | null
  cancelledReason?: string | null
  returnToDraftReason?: string | null
  returnedToDraftReason?: string | null
  workflowReason?: string | null
  lastWorkflowReason?: string | null
  approvedLoanId?: string | null
  approvedLoanNo?: string | null
  hasFinancialProfile?: boolean
  isFinancialProfileComplete?: boolean
  financialProfileUpdatedAt?: string | null
  financialDebtRatio?: number | null
  financialDebtToEquityRatio?: number | null
  grossDisbursementAmount?: number | null
  netDisbursementAmount?: number | null
  totalDisbursementFees?: number | null
  totalDisbursementInsurance?: number | null
  totalScheduledInsurance?: number | null
  disbursementJournalEntryId?: string | null
  interestRecognitionPolicyCode?: string | null
  feeRecognitionPolicyCode?: string | null
  disbursementCharges?: LoanDisbursementChargeResponse[]
  createdAt: string
}
