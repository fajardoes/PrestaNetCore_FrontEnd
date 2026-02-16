import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanApplicationApproveRequest } from '@/infrastructure/loans/requests/loan-application-approve-request'
import type { LoanApplicationCancelRequest } from '@/infrastructure/loans/requests/loan-application-cancel-request'
import type { LoanApplicationCollateralAddRequest } from '@/infrastructure/loans/requests/loan-application-collateral-add-request'
import type { LoanApplicationCreateRequest } from '@/infrastructure/loans/requests/loan-application-create-request'
import type { LoanApplicationRejectRequest } from '@/infrastructure/loans/requests/loan-application-reject-request'
import type { LoanApplicationSearchRequest } from '@/infrastructure/loans/requests/loan-application-search-request'
import type { LoanApplicationSubmitRequest } from '@/infrastructure/loans/requests/loan-application-submit-request'
import type { LoanApplicationUpdateRequest } from '@/infrastructure/loans/requests/loan-application-update-request'
import type { LoanSchedulePreviewRequest } from '@/infrastructure/loans/requests/loan-schedule-preview-request'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import type { LoanApplicationSearchResponse } from '@/infrastructure/loans/responses/loan-application-search-response'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'

const basePath = '/loan-applications'

export const createLoanApplication = async (
  dto: LoanApplicationCreateRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(basePath, dto)
  return data
}

export const updateLoanApplication = async (
  id: string,
  dto: LoanApplicationUpdateRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.put<LoanApplicationResponse>(
    `${basePath}/${id}`,
    dto,
  )
  return data
}

export const getLoanApplication = async (
  id: string,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.get<LoanApplicationResponse>(`${basePath}/${id}`)
  return data
}

export const searchLoanApplications = async (
  params: LoanApplicationSearchRequest,
): Promise<LoanApplicationSearchResponse> => {
  const { data } = await httpClient.get<LoanApplicationSearchResponse>(basePath, {
    params,
  })
  return data
}

export const addCollateral = async (
  applicationId: string,
  dto: LoanApplicationCollateralAddRequest,
): Promise<LoanApplicationCollateralResponse> => {
  const { data } = await httpClient.post<LoanApplicationCollateralResponse>(
    `${basePath}/${applicationId}/collaterals`,
    dto,
  )
  return data
}

export const listCollaterals = async (
  applicationId: string,
): Promise<LoanApplicationCollateralResponse[]> => {
  const { data } = await httpClient.get<LoanApplicationCollateralResponse[]>(
    `${basePath}/${applicationId}/collaterals`,
  )
  return data
}

export const removeCollateral = async (
  applicationId: string,
  linkId: string,
): Promise<void> => {
  await httpClient.delete(`${basePath}/${applicationId}/collaterals/${linkId}`)
}

export const submitApplication = async (
  id: string,
  dto: LoanApplicationSubmitRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(
    `${basePath}/${id}/submit`,
    dto,
  )
  return data
}

export const approveApplication = async (
  id: string,
  dto: LoanApplicationApproveRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(
    `${basePath}/${id}/approve`,
    dto,
  )
  return data
}

export const rejectApplication = async (
  id: string,
  dto: LoanApplicationRejectRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(
    `${basePath}/${id}/reject`,
    dto,
  )
  return data
}

export const cancelApplication = async (
  id: string,
  dto: LoanApplicationCancelRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(
    `${basePath}/${id}/cancel`,
    dto,
  )
  return data
}

export const previewSchedule = async (
  id: string,
  dto: LoanSchedulePreviewRequest,
): Promise<LoanSchedulePreviewResponse> => {
  const { data } = await httpClient.post<LoanSchedulePreviewResponse>(
    `${basePath}/${id}/schedule/preview`,
    dto,
  )
  return data
}
