import { getLoanApplicationScoringById } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'

export class GetLoanApplicationScoringByIdAction {
  async execute(
    loanApplicationId: string,
    scoreId: string,
  ): Promise<ApiResult<LoanApplicationCreditScoreResponse>> {
    try {
      const data = await getLoanApplicationScoringById(loanApplicationId, scoreId)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No se pudo obtener el scoring solicitado.')
    }
  }
}
