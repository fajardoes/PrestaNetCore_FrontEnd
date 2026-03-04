import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GetLoanApplicationActionsAction } from '@/core/actions/loan-applications/get-loan-application-actions.action'
import { SearchLoanApplicationsAction } from '@/core/actions/loan-applications/search-loan-applications.action'
import type { LoanApplicationAllowedAction } from '@/infrastructure/loans/responses/loan-application-actions-response'
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
  const actionsResolverRef = useRef(new GetLoanApplicationActionsAction())
  const requestIdRef = useRef(0)
  const [filters, setFilters] = useState<LoanApplicationsListFilters>({})
  const [skip, setSkip] = useState(0)
  const [take, setTake] = useState(DEFAULT_TAKE)
  const [allowedActionsById, setAllowedActionsById] = useState<
    Record<string, LoanApplicationAllowedAction[]>
  >({})
  const [isLoadingActions, setIsLoadingActions] = useState(false)
  const [state, setState] = useState<LoanApplicationsListState>({
    items: [],
    totalCount: 0,
    isLoading: false,
    error: null,
  })

  const loadActionsForItems = useCallback(async (items: LoanApplicationResponse[], requestId: number) => {
    if (!items.length) {
      if (requestId === requestIdRef.current) {
        setAllowedActionsById({})
        setIsLoadingActions(false)
      }
      return
    }

    setIsLoadingActions(true)

    const entries = await Promise.all(
      items.map(async (item) => {
        const result = await actionsResolverRef.current.execute(item.id)
        if (!result.success) {
          return [item.id, [] as LoanApplicationAllowedAction[]] as const
        }
        return [
          item.id,
          result.data.allowedActions as LoanApplicationAllowedAction[],
        ] as const
      }),
    )

    if (requestId !== requestIdRef.current) {
      return
    }

    setAllowedActionsById(Object.fromEntries(entries))
    setIsLoadingActions(false)
  }, [])

  const load = useCallback(
    async (override?: {
      filters?: LoanApplicationsListFilters
      skip?: number
      take?: number
    }) => {
      const nextFilters = override?.filters ?? filters
      const nextSkip = override?.skip ?? skip
      const nextTake = override?.take ?? take
      const requestId = requestIdRef.current + 1
      requestIdRef.current = requestId

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
        setAllowedActionsById({})
        void loadActionsForItems(result.data.items, requestId)
        return
      }

      setState({
        items: [],
        totalCount: 0,
        isLoading: false,
        error: result.error,
      })
      setAllowedActionsById({})
      setIsLoadingActions(false)
    },
    [filters, loadActionsForItems, skip, take],
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
    allowedActionsById,
    isLoadingActions,
    statusOptions,
    applyFilters,
    setPage,
    setTake: updateTake,
    reload: load,
  }
}
