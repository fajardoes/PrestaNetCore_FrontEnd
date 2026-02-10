import { useCallback, useEffect, useState } from 'react'
import { listDelinquencyPoliciesAction } from '@/core/actions/loans-delinquency-policy/list-delinquency-policies.action'
import type { DelinquencyPolicyListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-list-item.response'

interface UseActiveDelinquencyPoliciesState {
  items: DelinquencyPolicyListItemDto[]
  isLoading: boolean
  error: string | null
}

export const useActiveDelinquencyPolicies = () => {
  const [state, setState] = useState<UseActiveDelinquencyPoliciesState>({
    items: [],
    isLoading: false,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listDelinquencyPoliciesAction({ isActive: true })
    if (result.success) {
      setState({ items: result.data, isLoading: false, error: null })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
    reload: load,
  }
}
