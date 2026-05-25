export type DailyClosingRunStatus =
  | 'RUNNING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED'
  | 'COMPENSATED'
  | 'DRY_RUN_COMPLETED'
  | 'DRY_RUN_COMPLETED_WITH_ERRORS'

export interface DailyLoanClosingStatusResponse {
  businessDate: string
  isDayOpen: boolean
  hasRunningRun: boolean
  hasCompletedRunForBusinessDate: boolean
  currentRunId?: string | null
  currentRunStatus?: DailyClosingRunStatus | null
  pendingRegisteredPayments: number
  activeLoans: number
  overdueLoansEstimate: number
  postingContextStatus?: string | null
}
