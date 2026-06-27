export type LoanAllowedAction =
  | 'reverse_disbursement'
  | 'view_anticipated_installment'
  | 'apply_anticipated_installment'
  | 'reverse_anticipated_installment_application'

export interface LoanActionsResponse {
  loanId: string
  loanNumber?: string | null
  statusCode: string
  allowedActions: string[]
}
