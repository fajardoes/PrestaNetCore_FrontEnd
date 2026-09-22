export type LoanInterestAccrualMode = 'STANDARD' | 'REGULADA'

export interface LoanInterestAccrualSettingDto {
  interestAccrualMode: LoanInterestAccrualMode
  interestSuspensionDays: number
  loanInterestSuspenseGlAccountId: string | null
  loanInterestSuspenseGlAccountCode: string | null
  loanInterestSuspenseGlAccountName: string | null
  loanInterestSuspenseOffsetGlAccountId: string | null
  loanInterestSuspenseOffsetGlAccountCode: string | null
  loanInterestSuspenseOffsetGlAccountName: string | null
  isConfigured: boolean
  isValid: boolean
  validationMessage: string | null
}
