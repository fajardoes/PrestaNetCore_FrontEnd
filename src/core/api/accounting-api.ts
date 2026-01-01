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
import type { JournalEntryDetail, JournalEntryListItem } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { JournalFilter } from '@/infrastructure/interfaces/accounting/journal-filter'
import type { CreateJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/create-journal-entry.request'
import type { UpdateJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/update-journal-entry.request'
import type { VoidJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/void-journal-entry.request'
import type { LedgerEntry, LedgerResponse } from '@/infrastructure/interfaces/accounting/ledger-entry'

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

  async getJournalEntries(
    params: JournalFilter,
  ): Promise<PagedResponse<JournalEntryListItem>> {
    const { data } = await httpClient.get<PagedResponse<JournalEntryListItem>>(
      '/accounting/journal',
      { params },
    )
    return data
  },

  async getJournalEntryById(id: string): Promise<JournalEntryDetail> {
    const { data } = await httpClient.get<JournalEntryDetail>(`/accounting/journal/${id}`)
    return data
  },

  async createJournalEntry(
    payload: CreateJournalEntryRequest,
  ): Promise<JournalEntryDetail> {
    const { data } = await httpClient.post<JournalEntryDetail>(
      '/accounting/journal',
      payload,
    )
    return data
  },

  async updateJournalEntry(
    id: string,
    payload: UpdateJournalEntryRequest,
  ): Promise<JournalEntryDetail> {
    const { data } = await httpClient.put<JournalEntryDetail>(
      `/accounting/journal/${id}`,
      payload,
    )
    return data
  },

  async postJournalEntry(id: string): Promise<JournalEntryDetail> {
    const { data } = await httpClient.post<JournalEntryDetail>(
      `/accounting/journal/${id}/post`,
      {},
    )
    return data
  },

  async voidJournalEntry(
    id: string,
    payload: VoidJournalEntryRequest,
  ): Promise<JournalEntryDetail> {
    const { data } = await httpClient.post<JournalEntryDetail>(
      `/accounting/journal/${id}/void`,
      payload,
    )
    return data
  },

  async getLedger(params: {
    accountId: string
    fromDate?: string
    toDate?: string
    costCenterId?: string
    includeOpeningBalance?: boolean
  }): Promise<LedgerResponse> {
    const { data } = await httpClient.get<LedgerResponse | LedgerEntry[]>(
      '/accounting/ledger',
      { params },
    )

    if (Array.isArray(data)) {
      return { items: data }
    }

    if (data && typeof data === 'object' && 'items' in data) {
      return data as LedgerResponse
    }

    if (data && typeof data === 'object' && 'entries' in data) {
      const entries = (data as { entries?: LedgerEntry[] }).entries ?? []
      const openingBalance = (data as { openingBalance?: number }).openingBalance
      return { items: entries, openingBalance }
    }

    return { items: [] }
  },
}
