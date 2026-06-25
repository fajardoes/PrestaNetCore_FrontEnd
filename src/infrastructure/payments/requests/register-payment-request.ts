export type PaymentTypeCode =
  | 'CASH'
  | 'BANK_DEPOSIT_PROOF'
  | 'BANK_TRANSFER_PROOF'
  | 'MOBILE_PAYMENT_PROOF'

export interface RegisterPaymentRequest {
  loanId: string
  amount: number
  paymentTypeCode?: PaymentTypeCode
  referenceNumber?: string | null
  externalReceiptNumber?: string | null
  notes?: string | null
}

export interface RegisterCashCollectionPaymentRequest {
  loanId: string
  amount: number
  referenceNumber?: string | null
  externalReceiptNumber?: string | null
  notes?: string | null
}

export interface RegisterBankPaymentProofRequest {
  loanId: string
  bankEntityId?: string | null
  amount: number
  bankReferenceNumber: string
  bankDepositDate: string
  proofFile: File
  externalReceiptNumber?: string | null
  notes?: string | null
}
