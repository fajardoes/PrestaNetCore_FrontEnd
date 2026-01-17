export type AccountingPeriodState = 'open' | 'closed' | 'locked'

export interface AccountingPeriodDto {
  id: string
  fiscalYear: number
  month: number
  state: AccountingPeriodState
  openedAt?: string
  closedAt?: string
  notes?: string
}
