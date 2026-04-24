export interface ListPaymentsRequest {
  loanId?: string
  clientId?: string
  statusCode?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
