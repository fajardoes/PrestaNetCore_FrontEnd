import { getLoanApplicationListActions } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationListActionsResponse } from '@/infrastructure/loans/responses/loan-application-actions-response'

export class GetLoanApplicationListActionsAction {
  async execute(
    ids: string[],
    options?: { silent?: boolean },
  ): Promise<ApiResult<LoanApplicationListActionsResponse>> {
    try {
      const data = await getLoanApplicationListActions(
        ids,
        options?.silent ? { skipGlobalLoading: true } : undefined,
      )
      return { success: true, data }
    } catch (error) {
      const status = getAxiosStatus(error)
      if (status === 403) {
        return toApiError(error, 'No autorizado para consultar acciones de las solicitudes.')
      }
      return toApiError(
        error,
        'No fue posible obtener las acciones habilitadas para las solicitudes.',
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

