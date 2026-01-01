export interface TrialBalanceRowDto {
  accountId: string
  accountCode: string
  accountName: string
  parentAccountCode?: string | null
  parentAccountName?: string | null
  level: number
  openingBalance: number
  debit: number
  credit: number
  closingBalance: number
}

export interface TrialBalanceResultDto {
  fromDate?: string
  toDate?: string
  periodId?: string | null
  costCenterId?: string | null
  costCenterName?: string | null
  rows: TrialBalanceRowDto[]
  totalOpeningBalance: number
  totalDebit: number
  totalCredit: number
  totalClosingBalance: number
}
