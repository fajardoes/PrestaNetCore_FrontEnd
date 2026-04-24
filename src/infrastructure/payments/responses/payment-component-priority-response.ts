export interface PaymentComponentPriorityResponse {
  id: string
  componentCode: string
  componentName: string
  priorityOrder: number
  isActive: boolean
  notes?: string | null
}
