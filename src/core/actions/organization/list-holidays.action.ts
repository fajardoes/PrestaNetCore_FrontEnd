import { listHolidays } from '@/core/api/organization/holidays-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'

export const listHolidaysAction = async (): Promise<
  ApiResult<HolidayListItemDto[]>
> => {
  try {
    const result = await listHolidays()
    return { success: true, data: result }
  } catch (error) {
    return toApiError(error, 'No fue posible obtener los feriados.')
  }
}
