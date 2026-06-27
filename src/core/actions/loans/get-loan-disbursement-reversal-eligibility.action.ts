import { getLoanDisbursementReversalEligibility } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanDisbursementReversalEligibilityResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-eligibility-response'

export class GetLoanDisbursementReversalEligibilityAction {
  async execute(
    id: string,
  ): Promise<ApiResult<LoanDisbursementReversalEligibilityResponse>> {
    try {
      const data = await getLoanDisbursementReversalEligibility(id)
      return { success: true, data }
    } catch (error) {
      const status = getAxiosStatus(error)
      if (status === 403) {
        return toApiError(error, 'No autorizado para consultar elegibilidad de reversión.')
      }
      return toApiError(
        error,
        'No fue posible obtener la elegibilidad para revertir el desembolso.',
      )
    }
  }
}

const getAxiosStatus = (error: unknown): number | undefined => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  ) {
    return (error as { response?: { status?: number } }).response?.status
  }
  return undefined
}

const action = new GetLoanDisbursementReversalEligibilityAction()

export const getLoanDisbursementReversalEligibilityAction = (id: string) =>
  action.execute(id)
