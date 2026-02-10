import { httpClient } from '@/infrastructure/api/httpClient'
import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'
import type { HolidayDetailDto } from '@/infrastructure/interfaces/organization/holidays/holiday-detail.dto'
import type { HolidayCreateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-create.dto'
import type { HolidayUpdateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-update.dto'
import type { HolidayStatusUpdateDto } from '@/infrastructure/interfaces/organization/holidays/holiday-status-update.dto'

const basePath = '/organization/holidays'

export const listHolidays = async (): Promise<HolidayListItemDto[]> => {
  const { data } = await httpClient.get<HolidayListItemDto[]>(basePath)
  return data
}

export const getHoliday = async (id: string): Promise<HolidayDetailDto> => {
  const { data } = await httpClient.get<HolidayDetailDto>(`${basePath}/${id}`)
  return data
}

export const createHoliday = async (
  payload: HolidayCreateDto,
): Promise<HolidayDetailDto> => {
  const { data } = await httpClient.post<HolidayDetailDto>(basePath, payload)
  return data
}

export const updateHoliday = async (
  id: string,
  payload: HolidayUpdateDto,
): Promise<HolidayDetailDto> => {
  const { data } = await httpClient.put<HolidayDetailDto>(
    `${basePath}/${id}`,
    payload,
  )
  return data
}

export const updateHolidayStatus = async (
  id: string,
  payload: HolidayStatusUpdateDto,
): Promise<HolidayDetailDto> => {
  const { data } = await httpClient.patch<HolidayDetailDto>(
    `${basePath}/${id}/status`,
    payload,
  )
  return data
}
