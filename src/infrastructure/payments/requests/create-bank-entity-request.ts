export interface CreateBankEntityRequest {
  code: string
  name: string
  description?: string | null
  bankGlAccountId: string
}
