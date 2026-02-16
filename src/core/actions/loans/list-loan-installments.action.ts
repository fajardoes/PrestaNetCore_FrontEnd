import { listLoanInstallments } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanInstallmentResponse } from '@/infrastructure/loans/responses/loan-installment-response'

export class ListLoanInstallmentsAction {
  async execute(loanId: string): Promise<ApiResult<LoanInstallmentResponse[]>> {
    try {
      const data = await listLoanInstallments(loanId)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener las cuotas del préstamo.')
    }
  }
}

const action = new ListLoanInstallmentsAction()

export const listLoanInstallmentsAction = (loanId: string) => action.execute(loanId)
