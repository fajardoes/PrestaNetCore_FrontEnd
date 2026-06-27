import { reverseLoanDisbursement } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanDisbursementReversalRequest } from '@/infrastructure/loans/requests/loan-disbursement-reversal-request'
import type { LoanDisbursementReversalResponse } from '@/infrastructure/loans/responses/loan-disbursement-reversal-response'

export class ReverseLoanDisbursementAction {
  async execute(
    id: string,
    payload: LoanDisbursementReversalRequest,
  ): Promise<ApiResult<LoanDisbursementReversalResponse>> {
    try {
      const data = await reverseLoanDisbursement(id, payload)
      return { success: true, data }
    } catch (error) {
      const status = getAxiosStatus(error)
      if (status === 403) {
        return toApiError(error, 'No autorizado para revertir el desembolso del préstamo.')
      }
      if (status === 409) {
        return toApiError(
          error,
          'No es posible revertir el desembolso porque el préstamo ya posee movimientos posteriores. Primero deben revertirse los pagos u operaciones dependientes.',
        )
      }
      if (status === 400) {
        return toApiError(error, 'La solicitud de reversión contiene datos inválidos.')
      }
      return toApiError(error, 'No fue posible revertir el desembolso del préstamo.')
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

const action = new ReverseLoanDisbursementAction()

export const reverseLoanDisbursementAction = (
  id: string,
  payload: LoanDisbursementReversalRequest,
) => action.execute(id, payload)
