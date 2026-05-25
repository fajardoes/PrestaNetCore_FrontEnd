import { useCallback, useEffect, useMemo, useState } from 'react'
import { listPaymentsAction } from '@/core/actions/payments/list-payments.action'
import type { ListPaymentsRequest } from '@/infrastructure/payments/requests/list-payments-request'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

interface UsePaymentsListState {
  items: PaymentResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

const DEFAULT_PAGE_SIZE = 25

export const usePaymentsList = (
  enabled = true,
  initialFilters?: Omit<ListPaymentsRequest, 'page' | 'pageSize'>,
) => {
  const [filters, setFilters] = useState<ListPaymentsRequest>({
    ...initialFilters,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [state, setState] = useState<UsePaymentsListState>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    isLoading: false,
    error: null,
  })

  const load = useCallback(
    async (nextFilters: ListPaymentsRequest) => {
      if (!enabled) {
        setState({
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: DEFAULT_PAGE_SIZE,
          isLoading: false,
          error: null,
        })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listPaymentsAction(nextFilters)
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
        pageNumber: result.data.pageNumber,
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
    (nextFilters: Omit<ListPaymentsRequest, 'page' | 'pageSize'>) => {
      setFilters((prev) => ({
        ...prev,
        ...nextFilters,
        page: 1,
      }))
    },
    [],
  )

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page: Math.max(1, page),
    }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      pageSize,
    }))
  }, [])

  const refresh = useCallback(async () => {
    await load(filters)
  }, [filters, load])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.totalCount / (state.pageSize || DEFAULT_PAGE_SIZE))),
    [state.pageSize, state.totalCount],
  )

  return {
    items: state.items,
    totalCount: state.totalCount,
    page: state.pageNumber,
    pageSize: state.pageSize,
    totalPages,
    isLoading: state.isLoading,
    error: state.error,
    filters,
    applyFilters,
    setPage,
    setPageSize,
    refresh,
  }
}
