import {
  getOrganizationProfile,
  removeReportLogo,
  saveOrganizationProfile,
  uploadReportLogo,
} from '@/core/api/organization/organization-profile-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  OrganizationProfileDto,
  OrganizationProfileUpdateDto,
} from '@/infrastructure/interfaces/organization/organization-profile/organization-profile.dto'

export const getOrganizationProfileAction = async (): Promise<
  ApiResult<OrganizationProfileDto>
> => {
  try {
    return { success: true, data: await getOrganizationProfile() }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar los datos institucionales.')
  }
}

export const saveOrganizationProfileAction = async (
  payload: OrganizationProfileUpdateDto,
): Promise<ApiResult<OrganizationProfileDto>> => {
  try {
    return { success: true, data: await saveOrganizationProfile(payload) }
  } catch (error) {
    return toApiError(error, 'No fue posible guardar los datos institucionales.')
  }
}

export const uploadReportLogoAction = async (
  file: File,
): Promise<ApiResult<OrganizationProfileDto>> => {
  try {
    return { success: true, data: await uploadReportLogo(file) }
  } catch (error) {
    return toApiError(error, 'No fue posible cargar el logo institucional.')
  }
}

export const removeReportLogoAction = async (): Promise<
  ApiResult<OrganizationProfileDto>
> => {
  try {
    return { success: true, data: await removeReportLogo() }
  } catch (error) {
    return toApiError(error, 'No fue posible quitar el logo institucional.')
  }
}
