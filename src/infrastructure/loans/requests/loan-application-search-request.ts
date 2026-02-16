export interface LoanApplicationSearchRequest {
  search?: string
  clientId?: string
  loanProductId?: string
  promoterId?: string
  statusId?: string
  createdFrom?: string
  createdTo?: string
  skip?: number
  take?: number
}
