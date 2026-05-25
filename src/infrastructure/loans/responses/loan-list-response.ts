export interface LoanListItemResponse {
  id: string
  loanNo?: string | null
  clientId: string
  clientFullName?: string | null
  clientIdentityNo?: string | null
  loanProductId: string
  loanProductName?: string | null
  statusCode: string
  statusName: string
  principal: number
  createdOperationalDate: string
  firstDueDate?: string | null
  maturityDate?: string | null
  installmentsCount?: number | null
  totalOutstanding?: number | null
  totalPaid?: number | null
  isDisbursementReversed?: boolean | null
}

export interface LoanListSummaryResponse {
  activeLoansCount: number
  totalLoansCount: number
  totalPrincipal: number
  totalOutstanding: number
  nextDueDate?: string | null
}

export interface LoanListResponse {
  items: LoanListItemResponse[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  summary?: LoanListSummaryResponse | null
}
