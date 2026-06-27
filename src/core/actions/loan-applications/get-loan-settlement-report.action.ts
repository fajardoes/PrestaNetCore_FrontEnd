import type { AxiosError } from 'axios'
import { getLoanSettlementReport } from '@/core/api/reports/loan-reports-api'
import type { ApiResult } from '@/core/helpers/api-result'
import type { ReportFileResponse } from '@/infrastructure/reports/responses/report-file-response'

export class GetLoanSettlementReportAction {
  async execute(applicationId: string): Promise<ApiResult<ReportFileResponse>> {
    try {
      const data = await getLoanSettlementReport(applicationId)
      return { success: true, data }
    } catch (error) {
      const status = getAxiosError(error)?.response?.status
      const backendMessage = await getBlobErrorMessage(error)

      if (status === 401 || status === 403) {
        return failure(status, backendMessage || 'No autorizado para generar la liquidación.')
      }
      if (status === 404) {
        return failure(
          status,
          backendMessage || 'No se encontró la solicitud o faltan datos para generar la liquidación.',
        )
      }
      if (status === 409) {
        return failure(
          status,
          backendMessage || 'La solicitud todavía no tiene un préstamo desembolsado.',
        )
      }
      if (status === 502) {
        return failure(
          status,
          backendMessage || 'El servicio de reportes no está disponible en este momento.',
        )
      }

      return failure(
        status,
        backendMessage || 'No fue posible generar la liquidación del préstamo.',
      )
    }
  }
}

const failure = (status: number | undefined, error: string) => ({
  success: false as const,
  status,
  error,
})

const getAxiosError = (error: unknown): AxiosError | null => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  ) {
    return error as AxiosError
  }
  return null
}

const getBlobErrorMessage = async (error: unknown): Promise<string | null> => {
  const responseData = getAxiosError(error)?.response?.data
  if (!(responseData instanceof Blob)) return null

  try {
    const data = JSON.parse(await responseData.text()) as {
      detail?: unknown
      title?: unknown
    }
    if (typeof data.detail === 'string' && data.detail.trim()) {
      return data.detail.trim()
    }
    if (typeof data.title === 'string' && data.title.trim()) {
      return data.title.trim()
    }
  } catch {
    return null
  }

  return null
}

const action = new GetLoanSettlementReportAction()

export const getLoanSettlementReportAction = (applicationId: string) =>
  action.execute(applicationId)
