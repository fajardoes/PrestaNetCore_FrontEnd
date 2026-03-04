import { getLoanApplicationActions } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationActionsResponse } from '@/infrastructure/loans/responses/loan-application-actions-response'

export class GetLoanApplicationActionsAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationActionsResponse>> {
    try {
      const data = await getLoanApplicationActions(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(
        error,
        'No fue posible obtener las acciones habilitadas para la solicitud.',
      )
    }
  }
}

const action = new GetLoanApplicationActionsAction()

export const getLoanApplicationActionsAction = (id: string) => action.execute(id)
