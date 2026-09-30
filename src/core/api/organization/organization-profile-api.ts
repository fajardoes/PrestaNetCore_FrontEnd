import { httpClient } from '@/infrastructure/api/httpClient'
import type {
  OrganizationProfileDto,
  OrganizationProfileUpdateDto,
} from '@/infrastructure/interfaces/organization/organization-profile/organization-profile.dto'

const basePath = '/organization/profile'

export const getOrganizationProfile = async (): Promise<OrganizationProfileDto> => {
  const { data } = await httpClient.get<OrganizationProfileDto>(basePath)
  return data
}

export const saveOrganizationProfile = async (
  payload: OrganizationProfileUpdateDto,
): Promise<OrganizationProfileDto> => {
  const { data } = await httpClient.put<OrganizationProfileDto>(basePath, payload)
  return data
}

export const uploadReportLogo = async (file: File): Promise<OrganizationProfileDto> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await httpClient.post<OrganizationProfileDto>(
    `${basePath}/report-logo`,
    formData,
  )
  return data
}

export const removeReportLogo = async (): Promise<OrganizationProfileDto> => {
  const { data } = await httpClient.delete<OrganizationProfileDto>(
    `${basePath}/report-logo`,
  )
  return data
}
