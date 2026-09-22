export interface TrialBalanceRequestDto {
  fromDate?: string
  toDate?: string
  periodId?: string
  costCenterId?: string
  withoutCostCenter?: boolean
  includeSubaccounts?: boolean
  includeZeroBalanceAccounts?: boolean
}
