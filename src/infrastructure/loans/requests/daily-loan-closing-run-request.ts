export interface DailyLoanClosingRunRequest {
  businessDate?: string | null
  allowReprocess: boolean
  dryRun: boolean
  closeBusinessDayOnSuccess: boolean
  notes?: string | null
}
