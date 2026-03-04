export type LoanApplicationAllowedAction =
  | 'update_draft'
  | 'add_collateral'
  | 'remove_collateral'
  | 'submit'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'return_to_draft'
  | 'preview_schedule'

export interface LoanApplicationActionsResponse {
  loanApplicationId: string
  statusCode: string
  allowedActions: string[]
}
