import { generateLoanApplicationScoring } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'

export class GenerateLoanApplicationScoringAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationCreditScoreResponse>> {
    try {
      const data = await generateLoanApplicationScoring(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No se pudo generar el scoring de la solicitud.')
    }
  }
}
