import { httpClient } from '@/infrastructure/api/httpClient'
import type { ReportFileResponse } from '@/infrastructure/reports/responses/report-file-response'

const getFileNameFromContentDisposition = (header?: string): string | null => {
  if (!header) return null

  const encodedMatch = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1])
    } catch {
      return encodedMatch[1]
    }
  }

  const fileNameMatch = header.match(/filename="?([^";]+)"?/i)
  return fileNameMatch?.[1] ?? null
}

export const getPaymentReceiptReport = async (
  paymentId: string,
): Promise<ReportFileResponse> => {
  const response = await httpClient.get<Blob>(`/reports/payments/${paymentId}/receipt`, {
    responseType: 'blob',
  })

  return {
    blob: response.data,
    fileName:
      getFileNameFromContentDisposition(response.headers['content-disposition']) ??
      'ReciboPago.pdf',
    contentType: response.headers['content-type'] || response.data.type || 'application/pdf',
  }
}
