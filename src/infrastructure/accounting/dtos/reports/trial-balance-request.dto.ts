export interface TrialBalanceRequestDto {
  fromDate?: string
  toDate?: string
  periodId?: string
  costCenterId?: string
  includeSubaccounts?: boolean
  includeZeroBalanceAccounts?: boolean
}
