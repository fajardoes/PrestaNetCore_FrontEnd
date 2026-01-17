import { useCallback, useEffect, useState } from 'react'
import { listPeriodsAction } from '@/core/actions/accounting/list-periods.action'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'

const DEFAULT_PAGE_SIZE = 200

interface UsePeriodOptionsState {
  items: AccountingPeriodDto[]
  isLoading: boolean
  error: string | null
}

export const usePeriodOptions = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UsePeriodOptionsState>({
    items: [],
    isLoading: false,
    error: null,
  })

  const fetchPeriods = useCallback(async () => {
    if (!enabled) {
      setState({ items: [], isLoading: false, error: null })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await listPeriodsAction({
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    })

    if (result.success) {
      setState({ items: result.data.items, isLoading: false, error: null })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [enabled])

  useEffect(() => {
    void fetchPeriods()
  }, [fetchPeriods])

  return {
    periods: state.items,
    isLoading: state.isLoading,
    error: state.error,
    refresh: fetchPeriods,
  }
}
