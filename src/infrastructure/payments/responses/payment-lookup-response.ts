import type { LoanInstallmentComponentResponse } from '@/infrastructure/loans/responses/loan-installment-response'

export interface PaymentLookupClientResponse {
  id: string
  fullName: string
  identityNo?: string | null
}

export interface PaymentLookupInstallmentResponse {
  id: string
  installmentNo: number
  dueDateOriginal: string
  dueDateAdjusted: string
  totalProjected: number
  totalPaid: number
  outstandingAmount: number
  statusCode: string
  statusName: string
  components: LoanInstallmentComponentResponse[]
}

export interface PaymentLookupLoanResponse {
  id: string
  loanNo: string
  loanProductId: string
  loanProductName?: string | null
  statusCode: string
  statusName: string
  principal: number
  currencyCode: string
  firstDueDate?: string | null
  maturityDate?: string | null
  totalOutstanding: number
  nextPayableInstallment?: PaymentLookupInstallmentResponse | null
}

export interface PaymentLookupResponse {
  client?: PaymentLookupClientResponse | null
  loans: PaymentLookupLoanResponse[]
}
