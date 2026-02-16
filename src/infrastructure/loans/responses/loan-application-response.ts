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
  rejectedOperationalDate?: string | null
  cancelledOperationalDate?: string | null
  rejectedReason?: string | null
  cancelledReason?: string | null
  approvedLoanId?: string | null
  createdAt: string
}
