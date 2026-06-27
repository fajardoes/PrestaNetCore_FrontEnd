export interface BankEntityResponse {
  id: string
  code: string
  name: string
  description?: string | null
  isActive: boolean
  bankGlAccountId: string
  bankGlAccountCode?: string | null
  bankGlAccountName?: string | null
}
