export interface EffectivizePaymentRequest {
  bankGlAccountId: string
  effectivizationDate: string
  bankReferenceNumber?: string | null
  bankDepositDate?: string | null
  notes?: string | null
}

export interface ApproveBankPaymentProofRequest {
  bankGlAccountId: string
  effectivizationDate: string
  verifiedBankDepositDate?: string | null
  verifiedBankReferenceNumber?: string | null
  reviewNotes?: string | null
}
