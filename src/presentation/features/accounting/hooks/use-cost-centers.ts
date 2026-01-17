import { useCallback, useEffect, useState } from 'react'
import { listCostCentersAction } from '@/core/actions/accounting/list-cost-centers.action'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const DEFAULT_PAGE_SIZE = 10

interface UseCostCentersState {
  items: CostCenter[]
  totalPages: number
  totalCount: number
  isLoading: boolean
  error: string | null
}

export const useCostCenters = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseCostCentersState>({
    items: [],
    totalPages: 1,
    totalCount: 0,
    isLoading: false,
    error: null,
  })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active')
  const pageSize = DEFAULT_PAGE_SIZE

  const fetchCostCenters = useCallback(
    async (pageNumber: number) => {
      if (!enabled) {
        setState({
          items: [],
          totalPages: 1,
          totalCount: 0,
          isLoading: false,
          error: null,
        })
        return
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listCostCentersAction({
        page: pageNumber,
        pageSize,
        search: search.trim() || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      })

      if (result.success) {
        const totalPages = Math.max(
          1,
          Math.ceil(result.data.totalCount / pageSize),
        )
        setState({
          items: result.data.items,
          totalPages,
          totalCount: result.data.totalCount,
          isLoading: false,
          error: null,
        })
        setPage((prevPage) => Math.min(prevPage, totalPages))
      } else {
        setState({
          items: [],
          totalPages: 1,
          totalCount: 0,
          isLoading: false,
          error: result.error,
        })
      }
    },
    [enabled, pageSize, search, statusFilter],
  )

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, pageSize])

  useEffect(() => {
    void fetchCostCenters(page)
  }, [page, fetchCostCenters])

  return {
    costCenters: state.items,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    page,
    pageSize,
    isLoading: state.isLoading,
    error: state.error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setPage,
    refresh: () => fetchCostCenters(page),
  }
}
