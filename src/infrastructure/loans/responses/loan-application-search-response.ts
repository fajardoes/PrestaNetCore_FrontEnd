import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export interface LoanApplicationSearchResponse {
  items: LoanApplicationResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
}
