export interface UpdateBankEntityRequest {
  code: string
  name: string
  description?: string | null
  bankGlAccountId: string
  isActive: boolean
}
