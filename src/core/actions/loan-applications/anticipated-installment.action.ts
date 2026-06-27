import {
  cancelLoanApplicationAnticipatedInstallment,
  getLoanApplicationAnticipatedInstallment,
  listLoanApplicationAnticipatedInstallmentHistory,
  previewLoanApplicationAnticipatedInstallmentLimit,
  saveLoanApplicationAnticipatedInstallment,
} from '@/core/api/loans/loan-applications-api'
import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type {
  AnticipatedInstallmentLimitPreviewRequest,
  CancelAnticipatedInstallmentRequest,
  UpsertAnticipatedInstallmentRequest,
} from '@/infrastructure/loans/requests/anticipated-installment-request'
import type {
  AnticipatedInstallmentEventResponse,
  AnticipatedInstallmentLimitPreviewResponse,
  AnticipatedInstallmentResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'

export const getApplicationAnticipatedInstallmentAction = async (
  id: string,
): Promise<ApiResult<AnticipatedInstallmentResponse | null>> => {
  try {
    return { success: true, data: await getLoanApplicationAnticipatedInstallment(id) }
  } catch (error) {
    const result = toApiError(error, 'No fue posible consultar la cuota anticipada.')
    return result.status === 404
      ? { success: false, status: 404, error: 'La solicitud de crédito no fue encontrada.' }
      : result
  }
}

export const listApplicationAnticipatedInstallmentHistoryAction = async (
  id: string,
): Promise<ApiResult<AnticipatedInstallmentEventResponse[]>> => {
  try {
    return { success: true, data: await listLoanApplicationAnticipatedInstallmentHistory(id) }
  } catch (error) {
    const result = toApiError(error, 'No fue posible consultar el historial de cuota anticipada.')
    return result.status === 404
      ? { success: false, status: 404, error: 'La solicitud de crédito no fue encontrada.' }
      : result
  }
}

export const previewApplicationAnticipatedInstallmentLimitAction = async (
  id: string,
  payload: AnticipatedInstallmentLimitPreviewRequest,
): Promise<ApiResult<AnticipatedInstallmentLimitPreviewResponse>> => {
  try {
    return {
      success: true,
      data: await previewLoanApplicationAnticipatedInstallmentLimit(id, payload),
    }
  } catch (error) {
    return toApiError(error, 'No fue posible consultar el límite permitido.')
  }
}

export const saveApplicationAnticipatedInstallmentAction = async (
  id: string,
  payload: UpsertAnticipatedInstallmentRequest,
): Promise<ApiResult<AnticipatedInstallmentResponse>> => {
  try {
    return { success: true, data: await saveLoanApplicationAnticipatedInstallment(id, payload) }
  } catch (error) {
    return toApiError(error, 'No fue posible guardar la cuota anticipada.')
  }
}

export const cancelApplicationAnticipatedInstallmentAction = async (
  id: string,
  payload: CancelAnticipatedInstallmentRequest,
): Promise<ApiResult<AnticipatedInstallmentResponse>> => {
  try {
    return { success: true, data: await cancelLoanApplicationAnticipatedInstallment(id, payload) }
  } catch (error) {
    return toApiError(error, 'No fue posible cancelar la cuota anticipada.')
  }
}
