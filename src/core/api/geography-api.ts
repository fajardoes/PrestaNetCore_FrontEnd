import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  Department,
  DepartmentOperationResult,
  Municipality,
  MunicipalityOperationResult,
} from '@/infrastructure/interfaces/organization/geography'

const basePath = '/catalogs'

export interface DepartmentPayload {
  name: string
  slug: string
  code: string
  isActive: boolean
}

export interface MunicipalityPayload {
  departmentId: string
  name: string
  slug: string
  isActive: boolean
}

export const geographyApi = {
  async listDepartments(): Promise<Department[]> {
    const { data } = await httpClient.get<Department[]>(
      `${basePath}/departments`,
    )
    return data
  },

  async createDepartment(
    payload: DepartmentPayload,
  ): Promise<DepartmentOperationResult> {
    const { data } = await httpClient.post<DepartmentOperationResult>(
      `${basePath}/departments`,
      payload,
    )
    return data
  },

  async updateDepartment(
    departmentId: string,
    payload: DepartmentPayload,
  ): Promise<DepartmentOperationResult> {
    const { data } = await httpClient.put<DepartmentOperationResult>(
      `${basePath}/departments/${departmentId}`,
      payload,
    )
    return data
  },

  async listMunicipalities(
    departmentId?: string,
  ): Promise<Municipality[]> {
    const { data } = await httpClient.get<Municipality[]>(
      `${basePath}/municipalities`,
      {
        params: {
          departmentId,
        },
      },
    )
    return data
  },

  async createMunicipality(
    payload: MunicipalityPayload,
  ): Promise<MunicipalityOperationResult> {
    const { data } = await httpClient.post<MunicipalityOperationResult>(
      `${basePath}/municipalities`,
      payload,
    )
    return data
  },

  async updateMunicipality(
    municipalityId: string,
    payload: MunicipalityPayload,
  ): Promise<MunicipalityOperationResult> {
    const { data } = await httpClient.put<MunicipalityOperationResult>(
      `${basePath}/municipalities/${municipalityId}`,
      payload,
    )
    return data
  },
}
