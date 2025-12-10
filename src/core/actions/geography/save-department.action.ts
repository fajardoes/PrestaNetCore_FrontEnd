import { geographyApi, type DepartmentPayload } from '@/core/api/geography-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { Department } from '@/infrastructure/interfaces/organization/geography'

export const saveDepartmentAction = async (
  payload: DepartmentPayload,
  departmentId?: string,
): Promise<ApiResult<Department>> => {
  try {
    const result = departmentId
      ? await geographyApi.updateDepartment(departmentId, payload)
      : await geographyApi.createDepartment(payload)

    if (!result.succeeded || !result.department) {
      return {
        success: false,
        error:
          result.failureReason ??
          'No fue posible guardar el departamento. Verifica los datos.',
      }
    }

    return { success: true, data: result.department }
  } catch (error) {
    return toApiError(
      error,
      'No fue posible guardar el departamento. Verifica los datos.',
    )
  }
}
