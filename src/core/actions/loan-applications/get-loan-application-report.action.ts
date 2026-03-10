import { getLoanApplicationReport } from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationReportResponse } from '@/infrastructure/loans/responses/loan-application-report-response'

export class GetLoanApplicationReportAction {
  async execute(id: string): Promise<ApiResult<LoanApplicationReportResponse>> {
    try {
      const data = await getLoanApplicationReport(id)
      return { success: true, data }
    } catch (error) {
      const status = getAxiosStatus(error)
      if (status === 403) {
        return toApiError(error, 'No autorizado para imprimir la solicitud de crédito.')
      }
      if (status === 404) {
        return toApiError(error, 'No se encontró la solicitud de crédito a imprimir.')
      }
      return toApiError(error, 'No fue posible obtener los datos de impresión de la solicitud.')
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

const action = new GetLoanApplicationReportAction()

export const getLoanApplicationReportAction = (id: string) => action.execute(id)
