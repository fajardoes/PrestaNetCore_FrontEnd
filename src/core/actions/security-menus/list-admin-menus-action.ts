import { listAdminMenus } from '@/core/api/security/menus-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'

export class ListAdminMenusAction {
  async execute(): Promise<ApiResult<MenuItemAdminDto[]>> {
    try {
      const menus = await listAdminMenus()
      return { success: true, data: menus }
    } catch (error) {
      return toApiError<undefined>(
        error,
        'No fue posible obtener los menus.',
      )
    }
  }
}
