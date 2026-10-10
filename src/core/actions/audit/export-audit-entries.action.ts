import { isAxiosError } from 'axios'
import { auditApi } from '@/core/api/audit/audit-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { AuditSearchFilters } from '@/infrastructure/interfaces/audit/audit-entry'

export interface AuditCsvExport {
  blob: Blob
  fileName: string
  rowCount: number | null
  watermarkUtc: string | null
}

const getProblemMessage = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null
  const problem = value as { title?: unknown; detail?: unknown; errors?: unknown }
  const base = typeof problem.detail === 'string'
    ? problem.detail
    : typeof problem.title === 'string'
      ? problem.title
      : null
  const errors = problem.errors && typeof problem.errors === 'object'
    ? Object.values(problem.errors as Record<string, unknown>)
      .flatMap((messages) => Array.isArray(messages) ? messages : [messages])
      .filter((message): message is string => typeof message === 'string' && Boolean(message.trim()))
    : []
  const validation = Array.from(new Set(errors)).join(' • ')
  return base && validation ? `${base}: ${validation}` : validation || base
}

export const exportAuditEntriesAction = async (
  filters: AuditSearchFilters,
): Promise<ApiResult<AuditCsvExport>> => {
  try {
    return { success: true, data: await auditApi.exportEntries(filters) }
  } catch (error) {
    const failure = toApiError<AuditCsvExport>(error, 'No fue posible exportar los eventos de auditoría.')
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        const message = getProblemMessage(JSON.parse(await error.response.data.text()))
        if (message) return { ...failure, error: message }
      } catch {
        // Conserva el mensaje HTTP genérico si la respuesta no contiene JSON válido.
      }
    }
    if (!failure.success && failure.status === 403) {
      return { ...failure, error: 'No tienes permiso para exportar la auditoría.' }
    }
    if (!failure.success && failure.status === 401) {
      return { ...failure, error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }
    }
    return failure
  }
}
