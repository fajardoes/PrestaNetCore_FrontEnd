import { useCallback, useEffect, useState } from 'react'
import { listCostCentersAction } from '@/core/actions/accounting/list-cost-centers.action'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'

const DEFAULT_PAGE_SIZE = 200

interface UseCostCenterOptionsState {
  items: CostCenter[]
  isLoading: boolean
  error: string | null
}

export const useCostCenterOptions = (options?: { enabled?: boolean; isActive?: boolean | null; includeDeleted?: boolean }) => {
  const enabled = options?.enabled ?? true
  const isActive = options?.isActive === null ? undefined : options?.isActive ?? true
  const includeDeleted = options?.includeDeleted ?? false
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
    const items: CostCenter[] = []
    let page = 1
    let totalCount = 0

    while (page === 1 || items.length < totalCount) {
      const result = await listCostCentersAction({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        ...(isActive === undefined ? {} : { isActive }),
        ...(includeDeleted ? { includeDeleted: true } : {}),
      })

      if (!result.success) {
        setState({ items: [], isLoading: false, error: result.error })
        return
      }

      items.push(...result.data.items)
      totalCount = result.data.totalCount
      if (result.data.items.length === 0) break
      page += 1
    }

    setState({ items, isLoading: false, error: null })
  }, [enabled, includeDeleted, isActive])

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
