export interface LoanApplicationUpdateRequest {
  clientId: string
  loanProductId: string
  promoterId: string
  requestedPrincipal: number
  requestedTerm: number
  requestedPaymentFrequencyId: string
  suggestedPaymentFrequencyId?: string | null
  notes?: string | null
}
