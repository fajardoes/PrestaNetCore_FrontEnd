import { deleteAdminMenu } from '@/core/api/security/menus-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'

export class DeleteAdminMenuAction {
  async execute(menuId: string): Promise<ApiResult<void>> {
    try {
      await deleteAdminMenu(menuId)
      return { success: true, data: undefined }
    } catch (error) {
      return toApiError<undefined>(
        error,
        'No fue posible eliminar el menu.',
      )
    }
  }
}
