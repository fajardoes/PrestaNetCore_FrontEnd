import type { LoanDisbursementChargeResponse } from './loan-disbursement-charge-response'

export interface LoanResponse {
  id: string
  loanNo?: string | null
  applicationId: string
  clientId: string
  loanProductId: string
  statusId: string
  statusCode: string
  statusName: string
  principal: number
  term: number
  paymentFrequencyId: string
  paymentFrequencyCode: string
  paymentFrequencyName: string
  createdOperationalDate: string
  scheduleCommittedOperationalDate: string
  scheduleVersion: number
  installmentsCount?: number | null
  firstDueDate?: string | null
  maturityDate?: string | null
  nominalRate: number
  grossDisbursementAmount?: number | null
  netDisbursementAmount?: number | null
  totalDisbursementFees?: number | null
  totalDisbursementInsurance?: number | null
  disbursementJournalEntryId?: string | null
  interestRecognitionPolicyCode?: string | null
  feeRecognitionPolicyCode?: string | null
  disbursementCharges?: LoanDisbursementChargeResponse[]
}
