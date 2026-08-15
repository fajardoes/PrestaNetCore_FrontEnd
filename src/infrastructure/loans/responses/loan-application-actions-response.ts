export type LoanApplicationAllowedAction =
  | 'update_draft'
  | 'refresh_product_conditions'
  | 'edit_fees'
  | 'add_collateral'
  | 'remove_collateral'
  | 'generate_scoring'
  | 'view_scoring'
  | 'view_scoring_history'
  | 'submit'
  | 'approve'
  | 'set_first_due_date'
  | 'set_rate'
  | 'disburse'
  | 'reject'
  | 'cancel'
  | 'return_to_draft'
  | 'preview_schedule'
  | 'print'
  | 'view_anticipated_installment'
  | 'manage_anticipated_installment'
  | 'cancel_anticipated_installment'

export interface LoanApplicationActionsResponse {
  loanApplicationId: string
  statusCode: string
  allowedActions: string[]
}
