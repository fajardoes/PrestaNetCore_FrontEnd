import { useCallback, useEffect, useRef, useState } from 'react'
import { listDelinquencyPolicyAssignmentsAction } from '@/core/actions/loans-delinquency-policy-assignment/list-delinquency-policy-assignments.action'
import type { GetDelinquencyPolicyAssignmentsRequestDto } from '@/infrastructure/intranet/requests/loans/get-delinquency-policy-assignments.request'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'

interface DelinquencyPolicyAssignmentsListState {
  items: DelinquencyPolicyAssignmentListItemDto[]
  isLoading: boolean
  error: string | null
}

const defaultFilters: GetDelinquencyPolicyAssignmentsRequestDto = {
  agencyId: undefined,
  portfolioTypeId: undefined,
  isActive: undefined,
}

const normalizeFilters = (filters: GetDelinquencyPolicyAssignmentsRequestDto) => ({
  agencyId: filters.agencyId?.trim() || undefined,
  portfolioTypeId: filters.portfolioTypeId?.trim() || undefined,
  isActive: typeof filters.isActive === 'boolean' ? filters.isActive : undefined,
})

export const useDelinquencyPolicyAssignmentsList = () => {
  const [filters, setFilters] = useState<GetDelinquencyPolicyAssignmentsRequestDto>(
    defaultFilters,
  )
  const [state, setState] = useState<DelinquencyPolicyAssignmentsListState>({
    items: [],
    isLoading: false,
    error: null,
  })
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const load = useCallback(
    async (override?: GetDelinquencyPolicyAssignmentsRequestDto) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const appliedFilters = normalizeFilters(override ?? filtersRef.current)
      const result = await listDelinquencyPolicyAssignmentsAction(appliedFilters)
      if (result.success) {
        setState({ items: result.data, isLoading: false, error: null })
      } else {
        setState({ items: [], isLoading: false, error: result.error })
      }
    },
    [],
  )

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
