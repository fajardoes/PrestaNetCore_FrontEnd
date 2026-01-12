import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  ClientActivity,
  ClientCreatePayload,
  ClientDetail,
  ClientListItem,
  ClientReference,
  ClientUpdatePayload,
} from '@/infrastructure/interfaces/clients/client'
import type {
  ClientCatalogItem,
  EconomicActivityCatalog,
} from '@/infrastructure/interfaces/clients/catalog'
import type { PagedResult } from '@/types/pagination'

export interface CatalogFilters {
  parentSlug?: string
  search?: string
  onlyActive?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface EconomicActivityFilters {
  sectorId?: string
  search?: string
  onlyActive?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface ListClientsFilters {
  pageNumber?: number
  pageSize?: number
  search?: string
  municipioId?: string
  generoId?: string
  activo?: boolean
}

export interface ChildListFilters {
  pageNumber?: number
  pageSize?: number
  search?: string
  onlyActive?: boolean
}

const basePath = '/clientes'

export const clientesApi = {
  async listCatalogs(
    filters: CatalogFilters,
  ): Promise<PagedResult<ClientCatalogItem>> {
    const { data } = await httpClient.get<PagedResult<ClientCatalogItem>>(
      `${basePath}/catalogos`,
      { params: filters },
    )
    return data
  },

  async createCatalog(
    payload: Omit<ClientCatalogItem, 'id' | 'activo'> & { activo?: boolean },
  ): Promise<ClientCatalogItem> {
    const { data } = await httpClient.post<ClientCatalogItem>(
      `${basePath}/catalogos`,
      payload,
    )
    return data
  },

  async updateCatalog(
    catalogId: string,
    payload: Partial<ClientCatalogItem>,
  ): Promise<ClientCatalogItem> {
    const { data } = await httpClient.put<ClientCatalogItem>(
      `${basePath}/catalogos/${catalogId}`,
      payload,
    )
    return data
  },

  async toggleCatalog(
    catalogId: string,
    activo: boolean,
  ): Promise<ClientCatalogItem> {
    const { data } = await httpClient.patch<ClientCatalogItem>(
      `${basePath}/catalogos/${catalogId}/activo`,
      { activo },
    )
    return data
  },

  async deleteCatalog(catalogId: string): Promise<void> {
    await httpClient.delete(`${basePath}/catalogos/${catalogId}`)
  },

  async listEconomicActivities(
    filters: EconomicActivityFilters,
  ): Promise<PagedResult<EconomicActivityCatalog>> {
    const { data } = await httpClient.get<PagedResult<EconomicActivityCatalog>>(
      `${basePath}/catalogos/actividades_economicas`,
      { params: filters },
    )
    return data
  },

  async createEconomicActivity(
    payload: Omit<EconomicActivityCatalog, 'id' | 'sectorNombre'>,
  ): Promise<EconomicActivityCatalog> {
    const { data } = await httpClient.post<EconomicActivityCatalog>(
      `${basePath}/catalogos/actividades_economicas`,
      payload,
    )
    return data
  },

  async updateEconomicActivity(
    id: string,
    payload: Partial<EconomicActivityCatalog>,
  ): Promise<EconomicActivityCatalog> {
    const { data } = await httpClient.put<EconomicActivityCatalog>(
      `${basePath}/catalogos/actividades_economicas/${id}`,
      payload,
    )
    return data
  },

  async toggleEconomicActivity(
    id: string,
    activo: boolean,
  ): Promise<EconomicActivityCatalog> {
    const { data } = await httpClient.patch<EconomicActivityCatalog>(
      `${basePath}/catalogos/actividades_economicas/${id}/activo`,
      { activo },
    )
    return data
  },

  async deleteEconomicActivity(id: string): Promise<void> {
    await httpClient.delete(`${basePath}/catalogos/actividades_economicas/${id}`)
  },

  async listClients(
    filters: ListClientsFilters,
  ): Promise<PagedResult<ClientListItem>> {
    const { data } = await httpClient.get<PagedResult<ClientListItem>>(
      basePath,
      { params: filters },
    )
    return data
  },

  async getClient(clientId: string): Promise<ClientDetail> {
    const { data } = await httpClient.get<ClientDetail>(
      `${basePath}/${clientId}`,
    )
    return data
  },

  async createClient(payload: ClientCreatePayload): Promise<ClientDetail> {
    const { data } = await httpClient.post<ClientDetail>(basePath, payload)
    return data
  },

  async updateClient(
    clientId: string,
    payload: ClientUpdatePayload,
  ): Promise<ClientDetail> {
    const { data } = await httpClient.put<ClientDetail>(
      `${basePath}/${clientId}`,
      payload,
    )
    return data
  },

  async toggleClient(clientId: string, activo: boolean): Promise<void> {
    await httpClient.patch(`${basePath}/${clientId}/activo`, { activo })
  },

  async deleteClient(clientId: string): Promise<void> {
    await httpClient.delete(`${basePath}/${clientId}`)
  },

  async listClientReferences(
    clientId: string,
    filters: ChildListFilters,
  ): Promise<PagedResult<ClientReference>> {
    const { data } = await httpClient.get<PagedResult<ClientReference>>(
      `${basePath}/${clientId}/referencias`,
      { params: filters },
    )
    return data
  },

  async createClientReference(
    clientId: string,
    payload: Omit<ClientReference, 'id'>,
  ): Promise<ClientReference> {
    const { data } = await httpClient.post<ClientReference>(
      `${basePath}/${clientId}/referencias`,
      payload,
    )
    return data
  },

  async updateClientReference(
    clientId: string,
    referenceId: string,
    payload: Omit<ClientReference, 'id'>,
  ): Promise<ClientReference> {
    const { data } = await httpClient.put<ClientReference>(
      `${basePath}/${clientId}/referencias/${referenceId}`,
      payload,
    )
    return data
  },

  async toggleClientReference(
    clientId: string,
    referenceId: string,
    activo: boolean,
  ): Promise<ClientReference> {
    const { data } = await httpClient.patch<ClientReference>(
      `${basePath}/${clientId}/referencias/${referenceId}/activo`,
      { activo },
    )
    return data
  },

  async deleteClientReference(
    clientId: string,
    referenceId: string,
  ): Promise<void> {
    await httpClient.delete(`${basePath}/${clientId}/referencias/${referenceId}`)
  },

  async listClientActivities(
    clientId: string,
    filters: ChildListFilters,
  ): Promise<PagedResult<ClientActivity>> {
    const { data } = await httpClient.get<PagedResult<ClientActivity>>(
      `${basePath}/${clientId}/actividades`,
      { params: filters },
    )
    return data
  },

  async createClientActivity(
    clientId: string,
    payload: Omit<ClientActivity, 'id' | 'actividadNombre' | 'sectorNombre'>,
  ): Promise<ClientActivity> {
    const { data } = await httpClient.post<ClientActivity>(
      `${basePath}/${clientId}/actividades`,
      payload,
    )
    return data
  },

  async updateClientActivity(
    clientId: string,
    activityId: string,
    payload: Omit<ClientActivity, 'id' | 'actividadNombre' | 'sectorNombre'>,
  ): Promise<ClientActivity> {
    const { data } = await httpClient.put<ClientActivity>(
      `${basePath}/${clientId}/actividades/${activityId}`,
      payload,
    )
    return data
  },

  async toggleClientActivity(
    clientId: string,
    activityId: string,
    activo: boolean,
  ): Promise<ClientActivity> {
    const { data } = await httpClient.patch<ClientActivity>(
      `${basePath}/${clientId}/actividades/${activityId}/activo`,
      { activo },
    )
    return data
  },

  async deleteClientActivity(
    clientId: string,
    activityId: string,
  ): Promise<void> {
    await httpClient.delete(`${basePath}/${clientId}/actividades/${activityId}`)
  },
}
