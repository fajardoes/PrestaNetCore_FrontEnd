import { httpClient } from '@/infrastructure/api/httpClient'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

export interface AgencyPayload {
  name: string
  slug: string
  code: string
  isActive: boolean
}

export interface SaveAgencyResponse {
  succeeded: boolean
  agency?: Agency
}

export const catalogApi = {
  async listAgencies(): Promise<Agency[]> {
    const { data } = await httpClient.get<Agency[]>('/catalogs/agencies')
    return data
  },

  async createAgency(payload: AgencyPayload): Promise<SaveAgencyResponse> {
    const { data } = await httpClient.post<SaveAgencyResponse>(
      '/catalogs/agencies',
      payload,
    )
    return data
  },

  async updateAgency(
    agencyId: string,
    payload: AgencyPayload,
  ): Promise<SaveAgencyResponse> {
    const { data } = await httpClient.put<SaveAgencyResponse>(
      `/catalogs/agencies/${agencyId}`,
      payload,
    )
    return data
  },
}
