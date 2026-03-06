import { getLoanApplicationActions } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationActionsResponse } from '@/infrastructure/loans/responses/loan-application-actions-response'

export class GetLoanApplicationActionsAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationActionsResponse>> {
    try {
      const data = await getLoanApplicationActions(id)
      return { success: true, data }
    } catch (error) {
      const status = getAxiosStatus(error)
      if (status === 403) {
        return toApiError(error, 'No autorizado para consultar acciones de la solicitud.')
      }
      return toApiError(
        error,
        'No fue posible obtener las acciones habilitadas para la solicitud.',
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

const action = new GetLoanApplicationActionsAction()

export const getLoanApplicationActionsAction = (id: string) => action.execute(id)
