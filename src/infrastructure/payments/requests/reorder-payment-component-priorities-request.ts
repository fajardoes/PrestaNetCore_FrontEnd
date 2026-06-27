export interface ReorderPaymentComponentPrioritiesRequest {
  items: Array<{
    id: string
    priorityOrder: number
  }>
}
