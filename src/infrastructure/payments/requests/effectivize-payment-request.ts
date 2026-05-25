export interface EffectivizePaymentRequest {
  bankGlAccountId: string
  effectivizationDate: string
  bankReferenceNumber?: string | null
  bankDepositDate?: string | null
  notes?: string | null
}
