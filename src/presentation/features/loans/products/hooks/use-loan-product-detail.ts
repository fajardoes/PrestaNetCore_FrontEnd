import { useCallback, useState } from 'react'
import { getLoanProductAction } from '@/core/actions/loans/get-loan-product.action'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'

interface LoanProductDetailState {
  data: LoanProductDetailDto | null
  isLoading: boolean
  error: string | null
}

export const useLoanProductDetail = () => {
  const [state, setState] = useState<LoanProductDetailState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const loadById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getLoanProductAction(id)
    if (result.success) {
      setState({ data: result.data, isLoading: false, error: null })
    } else {
      setState({ data: null, isLoading: false, error: result.error })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    loadById,
    reset,
  }
}
