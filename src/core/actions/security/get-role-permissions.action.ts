import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityRolePermissions } from '@/infrastructure/interfaces/security/role-permission'

export const getRolePermissionsAction = async (
  roleName: string,
): Promise<ApiResult<SecurityRolePermissions>> => {
  try {
    const rolePermissions = await securityApi.getRolePermissions(roleName)
    return { success: true, data: rolePermissions }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 404) {
      return toApiError(error, 'Rol no encontrado.')
    }
    if (status === 403) {
      return toApiError(error, 'No autorizado para administrar permisos.')
    }
    return toApiError(error, 'No fue posible obtener permisos del rol.')
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
