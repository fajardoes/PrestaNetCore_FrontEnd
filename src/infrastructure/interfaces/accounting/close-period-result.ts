import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

export interface ClosePeriodResult {
  closedPeriod: AccountingPeriodDto
  openedPeriod: AccountingPeriodDto
}

