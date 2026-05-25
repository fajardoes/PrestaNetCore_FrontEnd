import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

export const createRoleAction = async (
  name: string,
): Promise<ApiResult<SecurityRole>> => {
  try {
    const result = await securityApi.createRole({ name })
    if (!result.succeeded) {
      return {
        success: false,
        error: result.failureReason || 'No fue posible crear el rol.',
      }
    }
    return { success: true, data: result.role }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 400) {
      return toApiError(error, 'Rol duplicado o datos inválidos.')
    }
    if (status === 403) {
      return toApiError(error, 'No autorizado para crear roles.')
    }
    return toApiError(error, 'No fue posible crear el rol.')
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
