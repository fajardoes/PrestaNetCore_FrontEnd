export type KnownDailyClosingRunStatus =
  | 'RUNNING'
  | 'FINALIZING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED'
  | 'CANCELLED'
  | 'ABANDONED'
  | 'COMPENSATED'
  | 'DRY_RUN_COMPLETED'
  | 'DRY_RUN_COMPLETED_WITH_ERRORS'

export type DailyClosingRunStatus =
  | KnownDailyClosingRunStatus
  | (string & {})

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
  currentRunHeartbeatAt?: string | null
  currentRunLeaseExpiresAt?: string | null
  recoveryRequired: boolean
}
