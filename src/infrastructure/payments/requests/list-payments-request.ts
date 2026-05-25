export interface ListPaymentsRequest {
  loanId?: string
  clientId?: string
  collectionChannelId?: string
  registeredByUserId?: string
  statusCode?: string
  paymentTypeCode?: string
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
