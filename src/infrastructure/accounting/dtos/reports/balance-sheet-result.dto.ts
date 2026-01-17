export interface BalanceSheetAccountDto {
  accountId: string
  accountCode: string
  accountName: string
  balance: number
}

export interface BalanceSheetGroupDto {
  groupKey: string
  groupName: string
  accounts: BalanceSheetAccountDto[]
  total: number
}

export interface BalanceSheetResultDto {
  fromDate?: string
  toDate?: string
  periodId?: string | null
  costCenterId?: string | null
  costCenterName?: string | null
  groups: BalanceSheetGroupDto[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
}
