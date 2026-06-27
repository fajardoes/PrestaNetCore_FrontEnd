import type { DailyClosingRunStatus } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'

export interface DailyClosingRunFiltersRequest {
  businessDate?: string
  status?: DailyClosingRunStatus
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
