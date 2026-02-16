import { getLoanInstallment } from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanInstallmentDetailResponse } from '@/infrastructure/loans/responses/loan-installment-detail-response'

export class GetLoanInstallmentAction {
  async execute(
    loanId: string,
    installmentNo: number,
  ): Promise<ApiResult<LoanInstallmentDetailResponse>> {
    try {
      const data = await getLoanInstallment(loanId, installmentNo)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener el detalle de la cuota.')
    }
  }
}

const action = new GetLoanInstallmentAction()

export const getLoanInstallmentAction = (loanId: string, installmentNo: number) =>
  action.execute(loanId, installmentNo)
