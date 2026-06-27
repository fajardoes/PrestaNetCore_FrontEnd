export interface LoanDisbursementAccountSettingDto {
  loanDisbursementGlAccountId: string | null
  loanDisbursementGlAccountCode: string | null
  loanDisbursementGlAccountName: string | null
  isConfigured: boolean
  isValid: boolean
  validationMessage: string | null
}
