import { useCallback, useState } from 'react'
import { getBalanceSheetAction } from '@/core/actions/accounting/get-balance-sheet.action'
import type { BalanceSheetResultDto } from '@/infrastructure/accounting/dtos/reports/balance-sheet-result.dto'

export interface BalanceSheetFilters {
  fromDate?: string
  toDate?: string
  periodId?: string
  costCenterId?: string
}

interface UseBalanceSheetState {
  data: BalanceSheetResultDto | null
  isLoading: boolean
  error: string | null
}

export const useBalanceSheet = () => {
  const [state, setState] = useState<UseBalanceSheetState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (filters: BalanceSheetFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getBalanceSheetAction({
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      periodId: filters.periodId || undefined,
      costCenterId: filters.costCenterId || undefined,
    })

    if (result.success) {
      setState({ data: result.data, isLoading: false, error: null })
    } else {
      setState({ data: null, isLoading: false, error: result.error })
    }
  }, [])

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
    load,
  }
}
