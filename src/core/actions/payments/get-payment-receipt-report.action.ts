import { getPaymentReceiptReport } from '@/core/api/reports/payment-reports-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ReportFileResponse } from '@/infrastructure/reports/responses/report-file-response'

export const getPaymentReceiptReportAction = async (
  paymentId: string,
): Promise<ApiResult<ReportFileResponse>> => {
  try {
    const result = await getPaymentReceiptReport(paymentId)
    return { success: true, data: result }
  } catch (error) {
    const apiError = toApiError(error, 'No fue posible obtener el recibo del pago.')
    if (apiError.status === 404) {
      return {
        ...apiError,
        error: 'El recibo no está disponible porque el pago no existe o no está dentro de tu alcance de consulta.',
      }
    }
    return apiError
  }
}
