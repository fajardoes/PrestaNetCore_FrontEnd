import { useCallback, useState } from 'react'
import { getPromoterAction } from '@/core/actions/sales-promoters/get-promoter-action'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'

interface PromoterDetailState {
  data: PromoterResponse | null
  isLoading: boolean
  error: string | null
}

export const usePromoterDetail = () => {
  const [state, setState] = useState<PromoterDetailState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const loadById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getPromoterAction(id)
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
