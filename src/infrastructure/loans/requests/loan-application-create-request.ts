export interface LoanApplicationCreateRequest {
  clientId: string
  loanProductId: string
  promoterId: string
  requestedPrincipal: number
  requestedTerm: number
  requestedPaymentFrequencyId: string
  suggestedPaymentFrequencyId?: string | null
  notes?: string | null
}
