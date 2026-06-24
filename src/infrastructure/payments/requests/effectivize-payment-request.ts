export interface EffectivizePaymentRequest {
  bankGlAccountId: string
  effectivizationDate: string
  bankReferenceNumber?: string | null
  bankDepositDate?: string | null
  notes?: string | null
}

export interface ApproveBankPaymentProofRequest {
  bankEntityId: string
  effectivizationDate: string
  verifiedBankDepositDate?: string | null
  verifiedBankReferenceNumber?: string | null
  reviewNotes?: string | null
  notes?: string | null
  bankDepositDate?: string | null
  bankReferenceNumber?: string | null
}
