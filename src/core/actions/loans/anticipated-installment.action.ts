import {
  applyLoanAnticipatedInstallment,
  createAnticipatedInstallmentSetting,
  deactivateAnticipatedInstallmentSetting,
  getLoanAnticipatedInstallment,
  listAnticipatedInstallmentLimitStrategies,
  listAnticipatedInstallmentSettings,
  listAnticipatedInstallmentStatuses,
  listLoanAnticipatedInstallmentApplications,
  reverseLoanAnticipatedInstallmentApplication,
  updateAnticipatedInstallmentSetting,
} from '@/core/api/loans/loans-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  ApplyAnticipatedInstallmentRequest,
  ReverseAnticipatedInstallmentApplicationRequest,
  UpsertAnticipatedInstallmentSettingsRequest,
} from '@/infrastructure/loans/requests/anticipated-installment-request'
import type {
  AnticipatedInstallmentApplicationResponse,
  AnticipatedInstallmentCatalogItem,
  AnticipatedInstallmentLoanDetailResponse,
  AnticipatedInstallmentSettingsResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'

export const getLoanAnticipatedInstallmentAction = async (
  id: string,
): Promise<ApiResult<AnticipatedInstallmentLoanDetailResponse | null>> => {
  try {
    return { success: true, data: await getLoanAnticipatedInstallment(id) }
  } catch (error) {
    const result = toApiError(error, 'No fue posible consultar la cuota anticipada.')
    return result.status === 404 ? { success: true, data: null } : result
  }
}

export const listLoanAnticipatedInstallmentApplicationsAction = async (
  id: string,
): Promise<ApiResult<AnticipatedInstallmentApplicationResponse[]>> => {
  try {
    return { success: true, data: await listLoanAnticipatedInstallmentApplications(id) }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar las aplicaciones de la cuota anticipada.')
  }
}

export const applyLoanAnticipatedInstallmentAction = async (
  id: string,
  payload: ApplyAnticipatedInstallmentRequest,
): Promise<ApiResult<AnticipatedInstallmentApplicationResponse>> => {
  try {
    return { success: true, data: await applyLoanAnticipatedInstallment(id, payload) }
  } catch (error) {
    return toApiError(error, 'No fue posible aplicar la cuota anticipada.')
  }
}

export const reverseLoanAnticipatedInstallmentApplicationAction = async (
  id: string,
  applicationId: string,
  payload: ReverseAnticipatedInstallmentApplicationRequest,
): Promise<ApiResult<AnticipatedInstallmentApplicationResponse>> => {
  try {
    return {
      success: true,
      data: await reverseLoanAnticipatedInstallmentApplication(id, applicationId, payload),
    }
  } catch (error) {
    return toApiError(error, 'No fue posible reversar la aplicación.')
  }
}

export const listAnticipatedInstallmentSettingsAction =
  async (): Promise<ApiResult<AnticipatedInstallmentSettingsResponse[]>> => {
    try {
      return { success: true, data: await listAnticipatedInstallmentSettings() }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar las reglas de cuota anticipada.')
    }
  }

export const saveAnticipatedInstallmentSettingAction = async (
  id: string | null,
  payload: UpsertAnticipatedInstallmentSettingsRequest,
): Promise<ApiResult<AnticipatedInstallmentSettingsResponse>> => {
  try {
    const data = id
      ? await updateAnticipatedInstallmentSetting(id, payload)
      : await createAnticipatedInstallmentSetting(payload)
    return { success: true, data }
  } catch (error) {
    return toApiError(error, 'No fue posible guardar la regla de cuota anticipada.')
  }
}

export const deactivateAnticipatedInstallmentSettingAction = async (
  id: string,
): Promise<ApiResult<void>> => {
  try {
    await deactivateAnticipatedInstallmentSetting(id)
    return { success: true, data: undefined }
  } catch (error) {
    return toApiError(error, 'No fue posible desactivar la regla de cuota anticipada.')
  }
}

export const listAnticipatedInstallmentLimitStrategiesAction =
  async (): Promise<ApiResult<AnticipatedInstallmentCatalogItem[]>> => {
    try {
      return { success: true, data: await listAnticipatedInstallmentLimitStrategies() }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar las estrategias de límite.')
    }
  }

export const listAnticipatedInstallmentStatusesAction =
  async (): Promise<ApiResult<AnticipatedInstallmentCatalogItem[]>> => {
    try {
      return { success: true, data: await listAnticipatedInstallmentStatuses() }
    } catch (error) {
      return toApiError(error, 'No fue posible consultar los estados de cuota anticipada.')
    }
  }
