import type {
  DailyClosingProcessCode,
  DailyClosingProcessingStatus,
} from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'

export interface DailyClosingRunDetailFiltersRequest {
  loanId?: string
  loanNo?: string
  processCode?: DailyClosingProcessCode
  processingStatus?: DailyClosingProcessingStatus
  page?: number
  pageSize?: number
}
