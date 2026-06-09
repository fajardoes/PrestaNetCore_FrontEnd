export type KnownDailyClosingProcessCode =
  | 'INTEREST_ACCRUAL'
  | 'DEFERRED_FEE_RECOGNITION'
  | 'INSTALLMENT_STATUS_REFRESH'
  | 'DELINQUENCY_ACCRUAL'
  | 'SNAPSHOT'
  | 'FINAL_VALIDATION'

export type DailyClosingProcessCode =
  | KnownDailyClosingProcessCode
  | (string & {})

export type KnownDailyClosingProcessingStatus =
  | 'PENDING'
  | 'PROCESSED'
  | 'SKIPPED'
  | 'FAILED'

export type DailyClosingProcessingStatus =
  | KnownDailyClosingProcessingStatus
  | (string & {})

export interface DailyLoanClosingRunDetailResponse {
  id: string
  runId: string
  loanId?: string | null
  loanNo?: string | null
  processCode: DailyClosingProcessCode
  processingStatus: DailyClosingProcessingStatus
  startedAt: string
  completedAt?: string | null
  generatedEvents: number
  generatedJournalEntries: number
  generatedAmount?: number | null
  errorMessage?: string | null
}
