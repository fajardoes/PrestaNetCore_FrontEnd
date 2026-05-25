export interface LoanClientSearchItemResponse {
  id: string
  clientFullName: string
  clientIdentityNo?: string | null
  activeLoansCount: number
  totalLoansCount: number
  nextDueDate?: string | null
}

export interface LoanClientSearchResponse {
  items: LoanClientSearchItemResponse[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}
