import { geographyApi } from '@/core/api/geography-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Department } from '@/infrastructure/interfaces/organization/geography'

export const listDepartmentsAction = async (): Promise<
  ApiResult<Department[]>
> => {
  try {
    const departments = await geographyApi.listDepartments()
    return { success: true, data: departments }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los departamentos.')
  }
}
