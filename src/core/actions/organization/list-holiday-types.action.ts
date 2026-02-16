import { listHolidayTypes } from '@/core/api/organization/holidays-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { HolidayTypeItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-type-item.dto'

export const listHolidayTypesAction = async (): Promise<
  ApiResult<HolidayTypeItemDto[]>
> => {
  try {
    const result = await listHolidayTypes()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los tipos de feriado.')
  }
}
