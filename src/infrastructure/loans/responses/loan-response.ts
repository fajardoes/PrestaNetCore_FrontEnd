import type { LoanDisbursementChargeResponse } from './loan-disbursement-charge-response'
import type { LoanInsuranceResponse } from './loan-insurance-response'
import type {
  PaymentFrequencyCode,
  TermUnitCode,
} from '@/infrastructure/loans/types/loan-contract.types'

export interface LoanResponse {
  id: string
  loanNo?: string | null
  applicationId: string
  clientId: string
  clientFullName?: string | null
  clientIdentityNo?: string | null
  loanProductId: string
  loanProductName?: string | null
  statusId: string
  statusCode: string
  statusName: string
  principal: number
  term: number
  termUnitId: string
  termUnitCode: TermUnitCode
  termUnitName: string
  paymentFrequencyId: string
  paymentFrequencyCode: PaymentFrequencyCode
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
  anticipatedInstallmentDeductionAmount?: number | null
  totalScheduledInsurance?: number | null
  disbursementJournalEntryId?: string | null
  disbursementJournalEntryNumber?: string | null
  isDisbursementReversed?: boolean | null
  disbursementReversedAt?: string | null
  disbursementReversalReason?: string | null
  disbursementReversalJournalEntryId?: string | null
  disbursementReversalJournalEntryNumber?: string | null
  interestRecognitionPolicyCode?: string | null
  feeRecognitionPolicyCode?: string | null
  insurance?: LoanInsuranceResponse | null
  disbursementCharges?: LoanDisbursementChargeResponse[]
}
