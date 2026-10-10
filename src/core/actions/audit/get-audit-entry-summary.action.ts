import { auditApi } from '@/core/api/audit/audit-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  AuditEntrySummary,
  AuditSearchFilters,
} from '@/infrastructure/interfaces/audit/audit-entry'

export const getAuditEntrySummaryAction = async (
  filters: AuditSearchFilters,
): Promise<ApiResult<AuditEntrySummary>> => {
  try {
    return { success: true, data: await auditApi.getSummary(filters) }
  } catch (error) {
    const failure = toApiError<AuditEntrySummary>(error, 'No fue posible consultar el resumen de auditoría.')
    if (!failure.success && failure.status === 403) {
      return { ...failure, error: 'No tienes permiso para consultar la auditoría.' }
    }
    if (!failure.success && failure.status === 401) {
      return { ...failure, error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }
    }
    return failure
  }
}
