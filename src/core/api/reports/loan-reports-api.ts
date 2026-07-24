import { httpClient } from '@/infrastructure/api/httpClient'
import type { ReportFileResponse } from '@/infrastructure/reports/responses/report-file-response'

const getHeaderValue = (headers: unknown, name: string): string | undefined => {
  if (!headers || typeof headers !== 'object') return undefined

  const headerBag = headers as Record<string, unknown> & {
    get?: (name: string) => unknown
  }
  const directValue = headerBag[name] ?? headerBag[name.toLowerCase()]
  const value = directValue ?? headerBag.get?.(name)

  return typeof value === 'string' ? value : undefined
}

const getFileNameFromContentDisposition = (header?: string): string | null => {
  if (!header) return null

  const encodedMatch = header.match(/filename\*=UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]).trim()
    } catch {
      return encodedMatch[1].trim()
    }
  }

  const fileNameMatch = header.match(/filename="?([^";]+)"?/i)
  return fileNameMatch?.[1]?.trim() ?? null
}

export const getLoanSettlementReport = async (
  applicationId: string,
): Promise<ReportFileResponse> => {
  const response = await httpClient.get<Blob>(
    `/reports/loan_settlement/${applicationId}`,
    { responseType: 'blob' },
  )

  return {
    blob: response.data,
    fileName:
      getFileNameFromContentDisposition(
        getHeaderValue(response.headers, 'content-disposition'),
      ) ??
      'LiquidacionCredito.pdf',
    contentType:
      getHeaderValue(response.headers, 'content-type') ||
      response.data.type ||
      'application/pdf',
  }
}
