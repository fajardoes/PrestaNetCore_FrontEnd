import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  AuditCatalog,
  AuditEntryPage,
  AuditEntrySummary,
  AuditSearchFilters,
} from '@/infrastructure/interfaces/audit/audit-entry'

const toQueryParams = (filters: AuditSearchFilters, includePagination = true): URLSearchParams => {
  const params = new URLSearchParams()

  for (const categoryCode of filters.categoryCodes ?? []) {
    params.append('categoryCodes', categoryCode)
  }

  const scalarFilters: Array<[string, string | number | undefined]> = [
    ['moduleCode', filters.moduleCode],
    ['actionCode', filters.actionCode],
    ['outcomeCode', filters.outcomeCode],
    ['errorCode', filters.errorCode],
    ['actorUserId', filters.actorUserId],
    ['agencyId', filters.agencyId],
    ['correlationId', filters.correlationId],
    ['requestMethod', filters.requestMethod],
    ['routeTemplate', filters.routeTemplate],
    ['httpStatusCode', filters.httpStatusCode],
    ['subjectType', filters.subjectType],
    ['subjectId', filters.subjectId],
    ['fromUtc', filters.fromUtc],
    ['toUtc', filters.toUtc],
  ]

  for (const [key, value] of scalarFilters) {
    if (value !== undefined && value !== '') {
      params.append(key, String(value))
    }
  }

  if (includePagination) {
    params.append('pageNumber', String(filters.pageNumber))
    params.append('pageSize', String(filters.pageSize))
  }

  return params
}

export interface AuditCsvExportResponse {
  blob: Blob
  fileName: string
  rowCount: number | null
  watermarkUtc: string | null
}

const inFlightAuditGetRequests = new Map<string, Promise<unknown>>()

const shareInFlightAuditGet = <T>(key: string, request: () => Promise<T>): Promise<T> => {
  const existingRequest = inFlightAuditGetRequests.get(key)
  if (existingRequest) {
    return existingRequest as Promise<T>
  }

  const pendingRequest = request()
  inFlightAuditGetRequests.set(key, pendingRequest)
  void pendingRequest.then(
    () => {
      if (inFlightAuditGetRequests.get(key) === pendingRequest) {
        inFlightAuditGetRequests.delete(key)
      }
    },
    () => {
      if (inFlightAuditGetRequests.get(key) === pendingRequest) {
        inFlightAuditGetRequests.delete(key)
      }
    },
  )

  return pendingRequest
}

export const auditApi = {
  getCatalog(): Promise<AuditCatalog> {
    return shareInFlightAuditGet('catalog', async () => {
      const { data } = await httpClient.get<AuditCatalog>('/audit/catalog')
      return data
    })
  },

  searchEntries(filters: AuditSearchFilters): Promise<AuditEntryPage> {
    const params = toQueryParams(filters)
    return shareInFlightAuditGet(`entries?${params.toString()}`, async () => {
      const { data } = await httpClient.get<AuditEntryPage>('/audit/entries', { params })
      return data
    })
  },

  getSummary(filters: AuditSearchFilters): Promise<AuditEntrySummary> {
    const params = toQueryParams(filters, false)
    return shareInFlightAuditGet(`summary?${params.toString()}`, async () => {
      const { data } = await httpClient.get<AuditEntrySummary>('/audit/entries/summary', { params })
      return data
    })
  },

  async exportEntries(filters: AuditSearchFilters): Promise<AuditCsvExportResponse> {
    const response = await httpClient.get<Blob>('/audit/entries/export', {
      params: toQueryParams(filters, false),
      responseType: 'blob',
    })
    const disposition = response.headers['content-disposition'] as string | undefined
    const encodedFileName = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
    const plainFileName = disposition?.match(/filename="?([^";]+)"?/i)?.[1]
    let fileName = encodedFileName ?? plainFileName ?? ''
    if (encodedFileName) {
      try {
        fileName = decodeURIComponent(encodedFileName)
      } catch {
        fileName = encodedFileName
      }
    }
    if (!/^[a-zA-Z0-9._-]+\.csv$/i.test(fileName)) {
      fileName = 'auditoria.csv'
    }

    const rowCountHeader = response.headers['x-prestanet-audit-row-count']
    const parsedRowCount = rowCountHeader === undefined ? Number.NaN : Number(String(rowCountHeader))
    const watermarkHeader = response.headers['x-prestanet-audit-watermark-utc']
    return {
      blob: response.data,
      fileName,
      rowCount: Number.isSafeInteger(parsedRowCount) && parsedRowCount >= 0 ? parsedRowCount : null,
      watermarkUtc: typeof watermarkHeader === 'string' ? watermarkHeader : null,
    }
  },
}
