import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

export const listRolesAction = async (): Promise<ApiResult<SecurityRole[]>> => {
  try {
    const roles = await securityApi.getRoles()
    const normalized = Array.isArray(roles)
      ? roles.map((role) =>
          typeof role === 'string' ? { name: role } : role,
        )
      : []
    return { success: true, data: normalized }
  } catch (error) {
    return toApiError<undefined>(error, 'No fue posible obtener los roles.')
  }
}
