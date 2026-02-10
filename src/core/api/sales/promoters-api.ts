import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  CreatePromoterRequest,
  PromoterResponse,
  PromotersSearchRequest,
  UpdatePromoterRequest,
} from '@/infrastructure/interfaces/sales/promoter'
import type { PagedResult } from '@/types/pagination'

const basePath = '/sales/promoters'

export const promotersApi = {
  async list(
    filters: PromotersSearchRequest,
  ): Promise<PagedResult<PromoterResponse>> {
    const { data } = await httpClient.get<PagedResult<PromoterResponse>>(
      basePath,
      { params: filters },
    )
    return data
  },

  async getById(id: string): Promise<PromoterResponse> {
    const { data } = await httpClient.get<PromoterResponse>(`${basePath}/${id}`)
    return data
  },

  async create(payload: CreatePromoterRequest): Promise<PromoterResponse> {
    const { data } = await httpClient.post<PromoterResponse>(basePath, payload)
    return data
  },

  async update(
    id: string,
    payload: UpdatePromoterRequest,
  ): Promise<PromoterResponse> {
    const { data } = await httpClient.put<PromoterResponse>(
      `${basePath}/${id}`,
      payload,
    )
    return data
  },
}
