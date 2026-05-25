import { httpClient } from '@/infrastructure/api/httpClient'
import type { LoanApplicationApproveRequest } from '@/infrastructure/loans/requests/loan-application-approve-request'
import type { LoanApplicationCancelRequest } from '@/infrastructure/loans/requests/loan-application-cancel-request'
import type { LoanApplicationCollateralAddRequest } from '@/infrastructure/loans/requests/loan-application-collateral-add-request'
import type { LoanApplicationCreateRequest } from '@/infrastructure/loans/requests/loan-application-create-request'
import type { LoanApplicationDisburseRequest } from '@/infrastructure/loans/requests/loan-application-disburse-request'
import type { LoanApplicationFeeOverridesUpsertRequest } from '@/infrastructure/loans/requests/loan-application-fee-overrides-upsert-request'
import type { LoanApplicationRejectRequest } from '@/infrastructure/loans/requests/loan-application-reject-request'
import type { LoanApplicationReturnToDraftRequest } from '@/infrastructure/loans/requests/loan-application-return-to-draft-request'
import type { LoanApplicationSearchRequest } from '@/infrastructure/loans/requests/loan-application-search-request'
import type { LoanApplicationSubmitRequest } from '@/infrastructure/loans/requests/loan-application-submit-request'
import type { LoanApplicationUpdateRequest } from '@/infrastructure/loans/requests/loan-application-update-request'
import type { LoanSchedulePreviewRequest } from '@/infrastructure/loans/requests/loan-schedule-preview-request'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanApplicationCreditScoreHistoryItemResponse } from '@/infrastructure/loans/responses/loan-application-credit-score-history-item.response'
import type { LoanApplicationCreditScoreResponse } from '@/infrastructure/loans/responses/loan-application-credit-score.response'
import type { LoanApplicationActionsResponse } from '@/infrastructure/loans/responses/loan-application-actions-response'
import type { LoanApplicationReportResponse } from '@/infrastructure/loans/responses/loan-application-report-response'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'
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

export const disburseApplication = async (
  id: string,
  dto: LoanApplicationDisburseRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(
    `${basePath}/${id}/disburse`,
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

export const returnLoanApplicationToDraft = async (
  id: string,
  dto: LoanApplicationReturnToDraftRequest,
): Promise<LoanApplicationResponse> => {
  const { data } = await httpClient.post<LoanApplicationResponse>(
    `${basePath}/${id}/return-to-draft`,
    dto,
  )
  return data
}

export const getLoanApplicationActions = async (
  id: string,
): Promise<LoanApplicationActionsResponse> => {
  const { data } = await httpClient.get<LoanApplicationActionsResponse>(
    `${basePath}/${id}/actions`,
  )
  return data
}

export const getLoanApplicationReport = async (
  id: string,
): Promise<LoanApplicationReportResponse> => {
  const { data } = await httpClient.get<LoanApplicationReportResponse>(
    `${basePath}/${id}/report`,
  )
  return data
}

export const getLoanApplicationFees = async (
  id: string,
): Promise<LoanApplicationFeeResponse[]> => {
  const { data } = await httpClient.get<LoanApplicationFeeResponse[]>(
    `${basePath}/${id}/fees`,
  )
  return data
}

export const saveLoanApplicationFeeOverrides = async (
  id: string,
  dto: LoanApplicationFeeOverridesUpsertRequest,
): Promise<LoanApplicationFeeResponse[]> => {
  const { data } = await httpClient.put<LoanApplicationFeeResponse[]>(
    `${basePath}/${id}/fees`,
    dto,
  )
  return data
}

export const getLoanApplicationScoring = async (
  id: string,
): Promise<LoanApplicationCreditScoreResponse> => {
  const { data } = await httpClient.get<LoanApplicationCreditScoreResponse>(
    `${basePath}/${id}/scoring`,
  )
  return data
}

export const generateLoanApplicationScoring = async (
  id: string,
): Promise<LoanApplicationCreditScoreResponse> => {
  const { data } = await httpClient.post<LoanApplicationCreditScoreResponse>(
    `${basePath}/${id}/scoring/generate`,
  )
  return data
}

export const getLoanApplicationScoringHistory = async (
  id: string,
): Promise<LoanApplicationCreditScoreHistoryItemResponse[]> => {
  const { data } = await httpClient.get<LoanApplicationCreditScoreHistoryItemResponse[]>(
    `${basePath}/${id}/scoring/history`,
  )
  return data
}

export const getLoanApplicationScoringById = async (
  id: string,
  scoreId: string,
): Promise<LoanApplicationCreditScoreResponse> => {
  const { data } = await httpClient.get<LoanApplicationCreditScoreResponse>(
    `${basePath}/${id}/scoring/${scoreId}`,
  )
  return data
}
