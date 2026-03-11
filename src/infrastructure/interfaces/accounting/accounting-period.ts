export type AccountingPeriodState = 'open' | 'closed' | 'locked'

export interface AccountingPeriodDto {
  id: string
  fiscalYear: number
  month: number
  state: AccountingPeriodState
  openedAt?: string
  closedAt?: string
  notes?: string
  allowAutomaticPosting?: boolean
  allowManualPosting?: boolean
  allowAdjustments?: boolean
  isClosed?: boolean
  isLocked?: boolean
  periodLabel?: string
  postingSummary?: string | null
}

export interface AccountingPostingContext {
  businessDate: string
  operationalPeriodResolvedFromBusinessDate: AccountingPeriodDto | null
  automaticPostingAllowed: boolean
  adjustmentPeriods: AccountingPeriodDto[]
  warnings: string[]
  validationMessages: string[]
}
