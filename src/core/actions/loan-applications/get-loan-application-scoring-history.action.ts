import { getLoanApplicationScoringHistory } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreditScoreHistoryItemResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-history-item.response'

export class GetLoanApplicationScoringHistoryAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationCreditScoreHistoryItemResponse[]>> {
    try {
      const data = await getLoanApplicationScoringHistory(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No se pudo obtener el historial de scoring de la solicitud.')
    }
  }
}
