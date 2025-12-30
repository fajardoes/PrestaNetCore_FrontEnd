import { httpClient } from '@/infrastructure/api/httpClient'
import type { ChartAccountDetail, ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { AccountingPeriodDto, AccountingPeriodState } from '@/infrastructure/interfaces/accounting/accounting-period'
import type { ClosePeriodResult } from '@/infrastructure/interfaces/accounting/close-period-result'
import type { PagedResponse } from '@/infrastructure/interfaces/accounting/paged-response'
import type { CreateChartAccountRequest } from '@/infrastructure/interfaces/accounting/requests/create-chart-account.request'
import type { UpdateChartAccountRequest } from '@/infrastructure/interfaces/accounting/requests/update-chart-account.request'
import type { CreateCostCenterRequest } from '@/infrastructure/interfaces/accounting/requests/create-cost-center.request'
import type { OpenPeriodRequest } from '@/infrastructure/interfaces/accounting/requests/open-period.request'
import type { ClosePeriodRequest } from '@/infrastructure/interfaces/accounting/requests/close-period.request'

export interface ChartAccountFilters {
  page: number
  pageSize: number
  search?: string
  parentId?: string
  isActive?: boolean
}

export interface CostCenterFilters {
  page: number
  pageSize: number
  search?: string
  isActive?: boolean
}

export interface PeriodFilters {
  page: number
  pageSize: number
  year?: number
  state?: AccountingPeriodState
}

export const accountingApi = {
  async getChartAccounts(
    params: ChartAccountFilters,
  ): Promise<PagedResponse<ChartAccountListItem>> {
    const { data } = await httpClient.get<PagedResponse<ChartAccountListItem>>(
      '/accounting/chart',
      { params },
    )
    return data
  },

  async getChartAccountById(id: string): Promise<ChartAccountDetail> {
    const { data } = await httpClient.get<ChartAccountDetail>(`/accounting/chart/${id}`)
    return data
  },

  async createChartAccount(
    payload: CreateChartAccountRequest,
  ): Promise<ChartAccountDetail> {
    const { data } = await httpClient.post<ChartAccountDetail>('/accounting/chart', payload)
    return data
  },

  async updateChartAccount(
    id: string,
    payload: UpdateChartAccountRequest,
  ): Promise<ChartAccountDetail> {
    const { data } = await httpClient.put<ChartAccountDetail>(`/accounting/chart/${id}`, payload)
    return data
  },

  async getCostCenters(
    params: CostCenterFilters,
  ): Promise<PagedResponse<CostCenter>> {
    const { data } = await httpClient.get<PagedResponse<CostCenter>>(
      '/accounting/cost_centers',
      { params },
    )
    return data
  },

  async createCostCenter(payload: CreateCostCenterRequest): Promise<CostCenter> {
    const { data } = await httpClient.post<CostCenter>(
      '/accounting/cost_centers',
      payload,
    )
    return data
  },

  async syncCostCentersWithAgencies(): Promise<{ succeeded: boolean }> {
    const { data } = await httpClient.post<{ succeeded: boolean }>(
      '/accounting/cost_centers/sync_with_agencies',
      {},
    )
    return data
  },

  async getPeriods(params: PeriodFilters): Promise<PagedResponse<AccountingPeriodDto>> {
    const { data } = await httpClient.get<PagedResponse<AccountingPeriodDto>>(
      '/accounting/periods',
      { params },
    )
    return data
  },

  async openPeriod(payload: OpenPeriodRequest): Promise<AccountingPeriodDto> {
    const { data } = await httpClient.post<AccountingPeriodDto>(
      '/accounting/periods/open',
      payload,
    )
    return data
  },

  async closePeriod(
    periodId: string,
    payload: ClosePeriodRequest,
  ): Promise<ClosePeriodResult> {
    const { data } = await httpClient.post<ClosePeriodResult>(
      `/accounting/periods/${periodId}/close`,
      payload,
    )
    return data
  },
}
