import { useCallback, useEffect, useState } from 'react'
import { listPromotersAction } from '@/core/actions/sales-promoters/list-promoters-action'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'
import type { PagedResult } from '@/types/pagination'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

interface Filters {
  search: string
  status: StatusFilterValue
}

interface ExplorerState {
  data: PagedResult<PromoterResponse> | null
  isLoading: boolean
  error: string | null
}

const PAGE_SIZE = 10

export const usePromotersExplorer = () => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'active',
  })
  const [page, setPage] = useState(1)
  const [state, setState] = useState<ExplorerState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const fetchPromoters = useCallback(
    async (pageNumber = page) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const normalizedSearch = normalizeSearch(filters.search)
      const active =
        filters.status === 'all'
          ? undefined
          : filters.status === 'active'
            ? true
            : false
      const result = await listPromotersAction({
        search: normalizedSearch || undefined,
        active,
        skip: (pageNumber - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      })
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null })
      } else {
        setState({ data: null, isLoading: false, error: result.error })
      }
    },
    [filters, page],
  )

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    void fetchPromoters(page)
  }, [fetchPromoters, page])

  const totalPages = (() => {
    const raw = state.data
    if (!raw) return 1
    const serverTotal =
      typeof raw.totalPages === 'number' && raw.totalPages > 0
        ? raw.totalPages
        : null
    const derivedFromCount =
      raw.totalCount && raw.totalCount > 0
        ? Math.ceil(raw.totalCount / PAGE_SIZE)
        : null
    const optimisticNextPage =
      raw.hasNextPage && !serverTotal && !derivedFromCount ? page + 1 : null
    return Math.max(1, serverTotal ?? derivedFromCount ?? optimisticNextPage ?? 1)
  })()

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const updateActive = (promoterId: string, isActive: boolean) => {
    setState((prev) => {
      if (!prev.data) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          items: prev.data.items.map((promoter) =>
            promoter.id === promoterId
              ? { ...promoter, isActive }
              : promoter,
          ),
        },
      }
    })
  }

  return {
    promoters: state.data?.items ?? [],
    page,
    totalPages,
    totalCount: state.data?.totalCount ?? 0,
    isLoading: state.isLoading,
    error: state.error,
    filters,
    setFilters,
    setPage,
    refresh: fetchPromoters,
    updateActive,
  }
}

const normalizeSearch = (value?: string) => {
  if (!value) return undefined
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
