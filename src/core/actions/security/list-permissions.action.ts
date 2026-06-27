import { securityApi } from '@/core/api/security-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { SecurityPermissionCatalogItem } from '@/infrastructure/interfaces/security/role-permission'

export const listPermissionsAction = async (): Promise<
  ApiResult<SecurityPermissionCatalogItem[]>
> => {
  try {
    const permissions = await securityApi.listPermissions()
    return { success: true, data: permissions }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener el catálogo de permisos.')
  }
}
