import { auditApi } from '@/core/api/audit/audit-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AuditCatalog } from '@/infrastructure/interfaces/audit/audit-entry'

export const getAuditCatalogAction = async (): Promise<ApiResult<AuditCatalog>> => {
  try {
    return { success: true, data: await auditApi.getCatalog() }
  } catch (error) {
    const failure = toApiError(error, 'No fue posible cargar el catálogo de auditoría.')
    if (!failure.success && failure.status === 403) {
      return { ...failure, error: 'No tienes permiso para consultar la auditoría.' }
    }
    if (!failure.success && failure.status === 401) {
      return { ...failure, error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }
    }
    return failure
  }
}
