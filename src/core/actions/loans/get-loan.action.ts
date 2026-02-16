import { getLoan } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

export class GetLoanAction {
  async execute(id: string): Promise<ApiResult<LoanResponse>> {
    try {
      const data = await getLoan(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener el préstamo.')
    }
  }
}

const action = new GetLoanAction()

export const getLoanAction = (id: string) => action.execute(id)
