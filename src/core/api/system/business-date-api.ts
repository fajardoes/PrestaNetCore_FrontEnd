import { httpClient } from '@/infrastructure/api/httpClient'
import type { BusinessDateStateDto } from '@/infrastructure/interfaces/system/business-date-state.dto'
import type { SetBusinessDateRequestDto } from '@/infrastructure/interfaces/system/set-business-date-request.dto'
import type { SetDayOpenRequestDto } from '@/infrastructure/interfaces/system/set-day-open-request.dto'

const basePath = '/system'

export const getBusinessDate = async (): Promise<BusinessDateStateDto> => {
  const { data } = await httpClient.get<BusinessDateStateDto>(
    `${basePath}/business-date`,
  )
  return data
}

export const setBusinessDate = async (
  payload: SetBusinessDateRequestDto,
): Promise<BusinessDateStateDto> => {
  const { data } = await httpClient.put<BusinessDateStateDto | undefined>(
    `${basePath}/business-date`,
    payload,
  )
  if (data) return data
  return getBusinessDate()
}

export const setBusinessDayStatus = async (
  payload: SetDayOpenRequestDto,
): Promise<BusinessDateStateDto> => {
  const { data } = await httpClient.patch<BusinessDateStateDto | undefined>(
    `${basePath}/business-day/status`,
    payload,
  )
  if (data) return data
  return getBusinessDate()
}
