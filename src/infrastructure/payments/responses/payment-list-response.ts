import type { PaymentResponse } from './payment-response'

export interface PaymentListResponse {
  items: PaymentResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
