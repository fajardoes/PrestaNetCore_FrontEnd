import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SearchLoanApplicationsAction } from '@/core/actions/loan-applications/search-loan-applications.action'
import type { LoanApplicationSearchRequest } from '@/infrastructure/loans/requests/loan-application-search-request'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'

export interface LoanApplicationsListFilters {
  search?: string
  clientId?: string
  loanProductId?: string
  promoterId?: string
  statusId?: string
  createdFrom?: string
  createdTo?: string
}

interface LoanApplicationsListState {
  items: LoanApplicationResponse[]
  totalCount: number
  isLoading: boolean
  error: string | null
}

const DEFAULT_TAKE = 20

const normalizeFilters = (
  filters: LoanApplicationsListFilters,
): LoanApplicationSearchRequest => ({
  search: filters.search?.trim() || undefined,
  clientId: filters.clientId?.trim() || undefined,
  loanProductId: filters.loanProductId?.trim() || undefined,
  promoterId: filters.promoterId?.trim() || undefined,
  statusId: filters.statusId?.trim() || undefined,
  createdFrom: filters.createdFrom || undefined,
  createdTo: filters.createdTo || undefined,
})

export const useLoanApplicationsList = () => {
  const actionRef = useRef(new SearchLoanApplicationsAction())
  const [filters, setFilters] = useState<LoanApplicationsListFilters>({})
  const [skip, setSkip] = useState(0)
  const [take, setTake] = useState(DEFAULT_TAKE)
  const [state, setState] = useState<LoanApplicationsListState>({
    items: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  })

  const load = useCallback(
    async (override?: {
      filters?: LoanApplicationsListFilters
      skip?: number
      take?: number
    }) => {
      const nextFilters = override?.filters ?? filters
      const nextSkip = override?.skip ?? skip
      const nextTake = override?.take ?? take

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await actionRef.current.execute({
        ...normalizeFilters(nextFilters),
        skip: nextSkip,
        take: nextTake,
      })

      if (result.success) {
        setState({
          items: result.data.items,
          totalCount: result.data.totalCount,
          isLoading: false,
          error: null,
        })
        return
      }

      setState({
        items: [],
        totalCount: 0,
        isLoading: false,
        error: result.error,
      })
    },
    [filters, skip, take],
  )

  useEffect(() => {
    void load()
  }, [load])

  const applyFilters = useCallback(
    (nextFilters: LoanApplicationsListFilters) => {
      setFilters(nextFilters)
      setSkip(0)
      void load({ filters: nextFilters, skip: 0 })
    },
    [load],
  )

  const page = Math.floor(skip / take) + 1
  const totalPages = Math.max(1, Math.ceil(state.totalCount / take))

  const setPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.min(Math.max(nextPage, 1), totalPages)
      const nextSkip = (safePage - 1) * take
      setSkip(nextSkip)
      void load({ skip: nextSkip })
    },
    [load, take, totalPages],
  )

  const updateTake = useCallback(
    (nextTake: number) => {
      const clamped = Math.min(Math.max(nextTake, 1), 200)
      setTake(clamped)
      setSkip(0)
      void load({ take: clamped, skip: 0 })
    },
    [load],
  )

  const statusOptions = useMemo(() => {
    const map = new Map<string, string>()
    state.items.forEach((item) => {
      if (item.statusId && item.statusName) {
        map.set(item.statusId, item.statusName)
      }
    })
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }, [state.items])

  return {
    filters,
    items: state.items,
    totalCount: state.totalCount,
    isLoading: state.isLoading,
    error: state.error,
    page,
    take,
    totalPages,
    statusOptions,
    applyFilters,
    setPage,
    setTake: updateTake,
    reload: load,
  }
}
