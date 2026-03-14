import { getLoanByCode } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanResponse } from '@/infrastructure/loans/responses/loan-response'

export class GetLoanByCodeAction {
  async execute(loanCode: string): Promise<ApiResult<LoanResponse>> {
    try {
      const data = await getLoanByCode(loanCode)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener el préstamo por código.')
    }
  }
}

const action = new GetLoanByCodeAction()

export const getLoanByCodeAction = (loanCode: string) => action.execute(loanCode)
