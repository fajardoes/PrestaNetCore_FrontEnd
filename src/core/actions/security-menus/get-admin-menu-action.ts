import { getAdminMenu } from '@/core/api/security/menus-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'

export class GetAdminMenuAction {
  async execute(menuId: string): Promise<ApiResult<MenuItemAdminDto>> {
    try {
      const menu = await getAdminMenu(menuId)
      return { success: true, data: menu }
    } catch (error) {
      return toApiError<undefined>(
        error,
        'No fue posible obtener el menu.',
      )
    }
  }
}
