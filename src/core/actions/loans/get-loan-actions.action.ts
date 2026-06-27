import { getLoanActions } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanActionsResponse } from '@/infrastructure/loans/responses/loan-actions-response'

export class GetLoanActionsAction {
  async execute(id: string): Promise<ApiResult<LoanActionsResponse>> {
    try {
      const data = await getLoanActions(id)
      return { success: true, data }
    } catch (error) {
      const status = getAxiosStatus(error)
      if (status === 403) {
        return toApiError(error, 'No autorizado para consultar acciones del préstamo.')
      }
      return toApiError(error, 'No fue posible obtener las acciones habilitadas del préstamo.')
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

const action = new GetLoanActionsAction()

export const getLoanActionsAction = (id: string) => action.execute(id)
