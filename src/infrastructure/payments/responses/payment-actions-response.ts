export type PaymentActionCode = string

export interface PaymentAction {
  code: PaymentActionCode
  label: string
  enabled: boolean
  reason: string | null
}

export interface PaymentActionsResponse {
  paymentId: string
  statusCode: string
  allowedActions: PaymentAction[]
}
