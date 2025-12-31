import { useCallback, useEffect, useState } from 'react'
import { listCostCentersAction } from '@/core/actions/accounting/list-cost-centers.action'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'

const DEFAULT_PAGE_SIZE = 200

interface UseCostCenterOptionsState {
  items: CostCenter[]
  isLoading: boolean
  error: string | null
}

export const useCostCenterOptions = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseCostCenterOptionsState>({
    items: [],
    isLoading: false,
    error: null,
  })

  const fetchCostCenters = useCallback(async () => {
    if (!enabled) {
      setState({ items: [], isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listCostCentersAction({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      isActive: true,
    })

    if (result.success) {
      setState({ items: result.data.items, isLoading: false, error: null })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchCostCenters()
  }, [fetchCostCenters])

  return {
    costCenters: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchCostCenters,
  }
}
