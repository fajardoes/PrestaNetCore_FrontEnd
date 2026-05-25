export interface UpdatePaymentComponentPriorityRequest {
  componentCode: string
  componentName: string
  priorityOrder: number
  isActive: boolean
  notes?: string | null
}
