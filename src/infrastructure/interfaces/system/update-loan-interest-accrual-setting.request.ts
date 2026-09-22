import type { LoanInterestAccrualMode } from './loan-interest-accrual-setting.dto'

export interface UpdateLoanInterestAccrualSettingRequest {
  interestAccrualMode: LoanInterestAccrualMode
  interestSuspensionDays: number
  loanInterestSuspenseGlAccountId: string | null
  loanInterestSuspenseOffsetGlAccountId: string | null
}
