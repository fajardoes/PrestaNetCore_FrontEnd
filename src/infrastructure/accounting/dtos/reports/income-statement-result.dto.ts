export interface IncomeStatementAccountDto {
  accountId: string
  accountCode: string
  accountName: string
  balance: number
}

export interface IncomeStatementGroupDto {
  groupKey: string
  groupName: string
  accounts: IncomeStatementAccountDto[]
  total: number
}

export interface IncomeStatementResultDto {
  fromDate?: string
  toDate?: string
  periodId?: string | null
  costCenterId?: string | null
  costCenterName?: string | null
  groups: IncomeStatementGroupDto[]
  totalIncome: number
  totalExpenses: number
  netResult: number
}
