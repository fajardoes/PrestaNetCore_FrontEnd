import { useCallback, useEffect, useState } from 'react'
import { getPaymentAction } from '@/core/actions/payments/get-payment.action'
import { listPaymentsAction } from '@/core/actions/payments/list-payments.action'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'

const PAGE_SIZE = 10

interface LoanPaymentsState {
  items: PaymentResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

export const useLoanPayments = (loanId?: string, enabled = false) => {
  const [state, setState] = useState<LoanPaymentsState>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: PAGE_SIZE,
    isLoading: false,
    error: null,
  })
  const [detailsByPaymentId, setDetailsByPaymentId] = useState<Record<string, PaymentResponse>>({})
  const [detailLoadingByPaymentId, setDetailLoadingByPaymentId] = useState<Record<string, boolean>>({})
  const [detailErrorsByPaymentId, setDetailErrorsByPaymentId] = useState<Record<string, string | null>>({})

  const loadPage = useCallback(
    async (requestedPage: number) => {
      if (!enabled || !loanId) return

      setState((previous) => ({ ...previous, isLoading: true, error: null }))
      const result = await listPaymentsAction({
        loanId,
        page: Math.max(1, requestedPage),
        pageSize: PAGE_SIZE,
      })

      if (!result.success) {
        setState((previous) => ({
          ...previous,
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
    [enabled, loanId],
  )

  useEffect(() => {
    setDetailsByPaymentId({})
    setDetailLoadingByPaymentId({})
    setDetailErrorsByPaymentId({})

    if (!enabled || !loanId) {
      setState({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: PAGE_SIZE,
        isLoading: false,
        error: null,
      })
      return
    }

    void loadPage(1)
  }, [enabled, loanId, loadPage])

  const loadPaymentDetail = useCallback(async (paymentId: string) => {
    if (detailsByPaymentId[paymentId] || detailLoadingByPaymentId[paymentId]) return

    setDetailLoadingByPaymentId((previous) => ({ ...previous, [paymentId]: true }))
    setDetailErrorsByPaymentId((previous) => ({ ...previous, [paymentId]: null }))
    const result = await getPaymentAction(paymentId)

    if (!result.success) {
      setDetailLoadingByPaymentId((previous) => ({ ...previous, [paymentId]: false }))
      setDetailErrorsByPaymentId((previous) => ({ ...previous, [paymentId]: result.error }))
      return
    }

    setDetailsByPaymentId((previous) => ({ ...previous, [paymentId]: result.data }))
    setDetailLoadingByPaymentId((previous) => ({ ...previous, [paymentId]: false }))
  }, [detailLoadingByPaymentId, detailsByPaymentId])

  const setPage = useCallback(
    (page: number) => {
      void loadPage(page)
    },
    [loadPage],
  )

  return {
    ...state,
    totalPages: Math.max(1, Math.ceil(state.totalCount / (state.pageSize || PAGE_SIZE))),
    detailsByPaymentId,
    detailLoadingByPaymentId,
    detailErrorsByPaymentId,
    loadPaymentDetail,
    setPage,
  }
}
