export type LoanApplicationAllowedAction =
  | 'update_draft'
  | 'edit_fees'
  | 'add_collateral'
  | 'remove_collateral'
  | 'generate_scoring'
  | 'view_scoring'
  | 'view_scoring_history'
  | 'submit'
  | 'approve'
  | 'disburse'
  | 'reject'
  | 'cancel'
  | 'return_to_draft'
  | 'preview_schedule'
  | 'print'

export interface LoanApplicationActionsResponse {
  loanApplicationId: string
  statusCode: string
  allowedActions: string[]
}
