export type PaymentTypeCode =
  | 'CASH'
  | 'BANK_DEPOSIT_PROOF'
  | 'BANK_TRANSFER_PROOF'
  | 'MOBILE_PAYMENT_PROOF'

export interface RegisterPaymentRequest {
  loanId: string
  paymentTypeCode: PaymentTypeCode
  amount: number
  referenceNumber?: string | null
  externalReceiptNumber?: string | null
  notes?: string | null
}
