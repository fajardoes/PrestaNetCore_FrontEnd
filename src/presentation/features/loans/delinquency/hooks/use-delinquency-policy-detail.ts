import { useCallback, useState } from 'react'
import { getDelinquencyPolicyDetailAction } from '@/core/actions/loans-delinquency-policy/get-delinquency-policy-detail.action'
import type { DelinquencyPolicyDetailDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-detail.response'

interface DelinquencyPolicyDetailState {
  data: DelinquencyPolicyDetailDto | null
  isLoading: boolean
  error: string | null
}

export const useDelinquencyPolicyDetail = () => {
  const [state, setState] = useState<DelinquencyPolicyDetailState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const loadById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getDelinquencyPolicyDetailAction(id)
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
