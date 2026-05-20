import type { DailyClosingRunStatus } from './daily-loan-closing-status-response'

export interface DailyLoanClosingRunResponse {
  id: string
  businessDate: string
  status: DailyClosingRunStatus
  totalLoans: number
  processedLoans: number
  failedLoans: number
  skippedLoans: number
  generatedJournalEntries: number
  generatedEvents: number
  generatedSnapshots: number
  executionTimeMs?: number | null
  errorMessage?: string | null
}
