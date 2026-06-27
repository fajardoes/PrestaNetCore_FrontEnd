import { httpClient } from '@/infrastructure/api/httpClient'
import type { DailyClosingRunDetailFiltersRequest } from '@/infrastructure/loans/requests/daily-closing-run-detail-filters-request'
import type { DailyClosingRunFiltersRequest } from '@/infrastructure/loans/requests/daily-closing-run-filters-request'
import type { DailyLoanClosingRunRequest } from '@/infrastructure/loans/requests/daily-loan-closing-run-request'
import type { DailyClosingPagedResult } from '@/infrastructure/loans/responses/daily-closing-paged-result'
import type { DailyLoanClosingRunDetailResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'
import type { DailyLoanClosingStatusResponse } from '@/infrastructure/loans/responses/daily-loan-closing-status-response'

const basePath = '/loans/daily-closing'

export const getDailyClosingStatus =
  async (): Promise<DailyLoanClosingStatusResponse> => {
    const { data } = await httpClient.get<DailyLoanClosingStatusResponse>(
      `${basePath}/status`,
    )
    return data
  }

export const runDailyClosing = async (
  payload: DailyLoanClosingRunRequest,
): Promise<DailyLoanClosingRunResponse> => {
  const { data } = await httpClient.post<DailyLoanClosingRunResponse>(
    `${basePath}/run`,
    payload,
  )
  return data
}

export const searchDailyClosingRuns = async (
  params: DailyClosingRunFiltersRequest,
): Promise<DailyClosingPagedResult<DailyLoanClosingRunResponse>> => {
  const { data } = await httpClient.get<
    DailyClosingPagedResult<DailyLoanClosingRunResponse>
  >(`${basePath}/runs`, { params })
  return data
}

export const getDailyClosingRun = async (
  id: string,
): Promise<DailyLoanClosingRunResponse> => {
  const { data } = await httpClient.get<DailyLoanClosingRunResponse>(
    `${basePath}/runs/${encodeURIComponent(id)}`,
  )
  return data
}

export const recoverDailyClosingRun = async (
  id: string,
): Promise<DailyLoanClosingRunResponse> => {
  const { data } = await httpClient.post<DailyLoanClosingRunResponse>(
    `${basePath}/runs/${encodeURIComponent(id)}/recover`,
  )
  return data
}

export const searchDailyClosingRunDetails = async (
  runId: string,
  params: DailyClosingRunDetailFiltersRequest,
): Promise<DailyClosingPagedResult<DailyLoanClosingRunDetailResponse>> => {
  const { data } = await httpClient.get<
    DailyClosingPagedResult<DailyLoanClosingRunDetailResponse>
  >(`${basePath}/runs/${encodeURIComponent(runId)}/details`, { params })
  return data
}
