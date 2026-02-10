import { useCallback, useEffect, useRef, useState } from 'react'
import { listDelinquencyPoliciesAction } from '@/core/actions/loans-delinquency-policy/list-delinquency-policies.action'
import type { GetDelinquencyPoliciesRequestDto } from '@/infrastructure/intranet/requests/loans/get-delinquency-policies.request'
import type { DelinquencyPolicyListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-list-item.response'

interface DelinquencyPoliciesListState {
  items: DelinquencyPolicyListItemDto[]
  isLoading: boolean
  error: string | null
}

const defaultFilters: GetDelinquencyPoliciesRequestDto = {
  search: '',
  isActive: undefined,
}

const normalizeFilters = (filters: GetDelinquencyPoliciesRequestDto) => ({
  search: filters.search?.trim() || undefined,
  isActive: typeof filters.isActive === 'boolean' ? filters.isActive : undefined,
})

export const useDelinquencyPoliciesList = () => {
  const [filters, setFilters] = useState<GetDelinquencyPoliciesRequestDto>(
    defaultFilters,
  )
  const [state, setState] = useState<DelinquencyPoliciesListState>({
    items: [],
    isLoading: false,
    error: null,
  })
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const load = useCallback(async (override?: GetDelinquencyPoliciesRequestDto) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const appliedFilters = normalizeFilters(override ?? filtersRef.current)
    const result = await listDelinquencyPoliciesAction(appliedFilters)
    if (result.success) {
      setState({ items: result.data, isLoading: false, error: null })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [])

  useEffect(() => {
    void load(filtersRef.current)
  }, [load])

  return {
    filters,
    setFilters,
    load,
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
  }
}
