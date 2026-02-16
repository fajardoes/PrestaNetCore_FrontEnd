import { previewSchedule } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanSchedulePreviewRequest } from '@/infrastructure/loans/requests/loan-schedule-preview-request'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'

export class PreviewLoanApplicationScheduleAction {
  async execute(
    id: string,
    payload: LoanSchedulePreviewRequest,
  ): Promise<ApiResult<LoanSchedulePreviewResponse>> {
    try {
      const data = await previewSchedule(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible previsualizar el cronograma.')
    }
  }
}

const action = new PreviewLoanApplicationScheduleAction()

export const previewLoanApplicationScheduleAction = (
  id: string,
  payload: LoanSchedulePreviewRequest,
) => action.execute(id, payload)
