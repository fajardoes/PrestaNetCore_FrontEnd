import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  AuditCatalog,
  AuditEntryPage,
  AuditSearchFilters,
} from '@/infrastructure/interfaces/audit/audit-entry'

const toQueryParams = (filters: AuditSearchFilters): URLSearchParams => {
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
    ['pageNumber', filters.pageNumber],
    ['pageSize', filters.pageSize],
  ]

  for (const [key, value] of scalarFilters) {
    if (value !== undefined && value !== '') {
      params.append(key, String(value))
    }
  }

  return params
}

export const auditApi = {
  async getCatalog(): Promise<AuditCatalog> {
    const { data } = await httpClient.get<AuditCatalog>('/audit/catalog')
    return data
  },

  async searchEntries(filters: AuditSearchFilters): Promise<AuditEntryPage> {
    const { data } = await httpClient.get<AuditEntryPage>('/audit/entries', {
      params: toQueryParams(filters),
    })
    return data
  },
}
