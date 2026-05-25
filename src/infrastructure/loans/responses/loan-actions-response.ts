export type LoanAllowedAction = 'reverse_disbursement'

export interface LoanActionsResponse {
  loanId: string
  loanNumber?: string | null
  statusCode: string
  allowedActions: string[]
}
