import { listLoans } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ListLoansRequest } from '@/infrastructure/loans/requests/list-loans-request'
import type { LoanListResponse } from '@/infrastructure/loans/responses/loan-list-response'

export class ListLoansAction {
  async execute(params: ListLoansRequest): Promise<ApiResult<LoanListResponse>> {
    try {
      const data = await listLoans(params)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener la lista de préstamos.')
    }
  }
}
