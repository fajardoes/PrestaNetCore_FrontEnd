import { httpClient } from '@/infrastructure/api/httpClient'
import type { IsBusinessDayResponseDto } from '@/infrastructure/interfaces/organization/holidays/is-business-day-response.dto'
import type { AdjustDateRequestDto } from '@/infrastructure/interfaces/organization/holidays/adjust-date-request.dto'
import type { AdjustDateResponseDto } from '@/infrastructure/interfaces/organization/holidays/adjust-date-response.dto'

const basePath = '/organization/business-calendar'

export const isBusinessDay = async (params: {
  date: string
  agencyId?: string
  portfolioTypeId?: string
}): Promise<IsBusinessDayResponseDto> => {
  const { data } = await httpClient.get<IsBusinessDayResponseDto>(
    `${basePath}/is-business-day`,
    {
      params,
    },
  )
  return data
}

export const adjustDate = async (
  payload: AdjustDateRequestDto,
): Promise<AdjustDateResponseDto> => {
  const { data } = await httpClient.post<AdjustDateResponseDto>(
    `${basePath}/adjust-date`,
    payload,
  )
  return data
}
