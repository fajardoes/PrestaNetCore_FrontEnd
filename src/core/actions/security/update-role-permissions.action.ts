import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  SecurityRolePermissions,
  UpdateRolePermissionsPayload,
} from '@/infrastructure/interfaces/security/role-permission'

export const updateRolePermissionsAction = async (
  roleName: string,
  permissions: string[],
): Promise<ApiResult<SecurityRolePermissions>> => {
  try {
    const payload: UpdateRolePermissionsPayload = { permissions }
    const result = await securityApi.updateRolePermissions(roleName, payload)

    if (!result.succeeded) {
      return {
        success: false,
        error: result.failureReason || 'No fue posible actualizar permisos del rol.',
      }
    }

    return { success: true, data: result.role }
  } catch (error) {
    const status = getAxiosStatus(error)
    if (status === 404) {
      return toApiError(error, 'Rol no encontrado.')
    }
    if (status === 403) {
      return toApiError(error, 'No autorizado para administrar permisos.')
    }
    if (status === 400) {
      const failureReason = getFailureReason(error)
      return {
        success: false,
        error:
          failureReason ||
          toApiError(error, 'Permisos inválidos o request inválido.').error,
        status,
      }
    }
    return toApiError(error, 'No fue posible actualizar permisos del rol.')
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

const getFailureReason = (error: unknown): string | null => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  ) {
    const data = (error as { response?: { data?: unknown } }).response?.data
    if (
      data &&
      typeof data === 'object' &&
      'failureReason' in data &&
      typeof (data as { failureReason?: unknown }).failureReason === 'string'
    ) {
      return (data as { failureReason: string }).failureReason
    }
  }
  return null
}
