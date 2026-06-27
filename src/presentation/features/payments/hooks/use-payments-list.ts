import { useCallback, useEffect, useMemo, useState } from 'react'
import { listBankPaymentProofsAction } from '@/core/actions/payments/list-bank-payment-proofs.action'
import { listCashCollectionPaymentsAction } from '@/core/actions/payments/list-cash-collection-payments.action'
import { listPaymentsAction } from '@/core/actions/payments/list-payments.action'
import type { ListPaymentsRequest } from '@/infrastructure/payments/requests/list-payments-request'
import type { PaymentListResponse } from '@/infrastructure/payments/responses/payment-list-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import type { ApiResult } from '@/core/helpers/api-result'

interface UsePaymentsListState {
  items: PaymentResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

const DEFAULT_PAGE_SIZE = 25
export type PaymentsListSource = 'legacy' | 'cash-collections' | 'bank-proofs'

const listBySource = (
  source: PaymentsListSource,
  params: ListPaymentsRequest,
): Promise<ApiResult<PaymentListResponse>> => {
  if (source === 'cash-collections') return listCashCollectionPaymentsAction(params)
  if (source === 'bank-proofs') return listBankPaymentProofsAction(params)
  return listPaymentsAction(params)
}

export const usePaymentsList = (
  enabled = true,
  initialFilters?: Omit<ListPaymentsRequest, 'page' | 'pageSize'>,
  source: PaymentsListSource = 'legacy',
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
      const result = await listBySource(source, nextFilters)
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
    [enabled, source],
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
