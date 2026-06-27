import { searchLoanApplications } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationSearchRequest } from '@/infrastructure/loans/requests/loan-application-search-request'
import type { LoanApplicationSearchResponse } from '@/infrastructure/loans/responses/loan-application-search-response'

export class SearchLoanApplicationsAction {
  async execute(
    params: LoanApplicationSearchRequest,
  ): Promise<ApiResult<LoanApplicationSearchResponse>> {
    try {
      const data = await searchLoanApplications(params)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible buscar solicitudes de crédito.')
    }
  }
}

const action = new SearchLoanApplicationsAction()

export const searchLoanApplicationsAction = (params: LoanApplicationSearchRequest) =>
  action.execute(params)
