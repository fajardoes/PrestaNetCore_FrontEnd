import { useCallback, useEffect, useMemo, useState } from 'react'
import { searchDailyClosingRunDetailsAction } from '@/core/actions/loans/search-daily-closing-run-details.action'
import type { DailyClosingRunDetailFiltersRequest } from '@/infrastructure/loans/requests/daily-closing-run-detail-filters-request'
import type { DailyLoanClosingRunDetailResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-detail-response'

interface DailyClosingRunDetailsListState {
  items: DailyLoanClosingRunDetailResponse[]
  totalCount: number
  page: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

const DEFAULT_PAGE_SIZE = 25

const normalizeFilters = (
  filters: DailyClosingRunDetailFiltersRequest,
): DailyClosingRunDetailFiltersRequest => ({
  loanId: filters.loanId?.trim() || undefined,
  loanNo: filters.loanNo?.trim() || undefined,
  processCode: filters.processCode,
  processingStatus: filters.processingStatus,
  page: filters.page ?? 1,
  pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
})

export const useDailyClosingRunDetailsList = (
  runId: string | undefined,
  enabled = true,
) => {
  const [filters, setFilters] = useState<DailyClosingRunDetailFiltersRequest>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [state, setState] = useState<DailyClosingRunDetailsListState>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    isLoading: false,
    error: null,
  })

  const load = useCallback(
    async (nextFilters: DailyClosingRunDetailFiltersRequest) => {
      if (!enabled || !runId) {
        setState({
          items: [],
          totalCount: 0,
          page: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          isLoading: false,
          error: null,
        })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await searchDailyClosingRunDetailsAction(
        runId,
        normalizeFilters(nextFilters),
      )
      if (!result.success) {
        setState((prev) => ({
          ...prev,
          items: [],
          totalCount: 0,
          isLoading: false,
          error: result.error,
        }))
        return
      }

      setState({
        items: result.data.items,
        totalCount: result.data.totalCount,
        page: result.data.page,
        pageSize: result.data.pageSize,
        isLoading: false,
        error: null,
      })
    },
    [enabled, runId],
  )

  useEffect(() => {
    void load(filters)
  }, [filters, load])

  const applyFilters = useCallback(
    (nextFilters: Omit<DailyClosingRunDetailFiltersRequest, 'page' | 'pageSize'>) => {
      setFilters((prev) => ({
        ...prev,
        ...nextFilters,
        page: 1,
      }))
    },
    [],
  )

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, page) }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({ ...prev, page: 1, pageSize }))
  }, [])

  const refresh = useCallback(async () => {
    await load(filters)
  }, [filters, load])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.totalCount / (state.pageSize || DEFAULT_PAGE_SIZE))),
    [state.pageSize, state.totalCount],
  )

  return {
    ...state,
    filters,
    totalPages,
    applyFilters,
    setPage,
    setPageSize,
    refresh,
  }
}
