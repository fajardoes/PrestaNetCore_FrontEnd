import { searchLoanClients } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanClientsSearchRequest } from '@/infrastructure/loans/requests/loan-clients-search-request'
import type { LoanClientSearchResponse } from '@/infrastructure/loans/responses/loan-client-search-response'

export class SearchLoanClientsAction {
  async execute(
    params: LoanClientsSearchRequest,
  ): Promise<ApiResult<LoanClientSearchResponse>> {
    try {
      const data = await searchLoanClients(params)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible buscar clientes con préstamos.')
    }
  }
}
