export interface CreatePaymentComponentPriorityRequest {
  componentCode: string
  componentName: string
  priorityOrder: number
  notes?: string | null
}
