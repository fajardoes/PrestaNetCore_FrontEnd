import { useCallback, useEffect, useMemo, useState } from 'react'
import { searchDailyClosingRunsAction } from '@/core/actions/loans/search-daily-closing-runs.action'
import type { DailyClosingRunFiltersRequest } from '@/infrastructure/loans/requests/daily-closing-run-filters-request'
import type { DailyLoanClosingRunResponse } from '@/infrastructure/loans/responses/daily-loan-closing-run-response'

interface DailyClosingRunsListState {
  items: DailyLoanClosingRunResponse[]
  totalCount: number
  page: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

const DEFAULT_PAGE_SIZE = 25

const normalizeFilters = (
  filters: DailyClosingRunFiltersRequest,
): DailyClosingRunFiltersRequest => ({
  businessDate: filters.businessDate?.trim() || undefined,
  status: filters.status,
  from: filters.from?.trim() || undefined,
  to: filters.to?.trim() || undefined,
  page: filters.page ?? 1,
  pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
})

export const useDailyClosingRunsList = (enabled = true) => {
  const [filters, setFilters] = useState<DailyClosingRunFiltersRequest>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [state, setState] = useState<DailyClosingRunsListState>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    isLoading: false,
    error: null,
  })

  const load = useCallback(
    async (nextFilters: DailyClosingRunFiltersRequest) => {
      if (!enabled) {
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
      const result = await searchDailyClosingRunsAction(normalizeFilters(nextFilters))
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
    [enabled],
  )

  useEffect(() => {
    void load(filters)
  }, [filters, load])

  const applyFilters = useCallback(
    (nextFilters: Omit<DailyClosingRunFiltersRequest, 'page' | 'pageSize'>) => {
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
