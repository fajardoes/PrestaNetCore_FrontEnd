import { useCallback, useState } from 'react'
import { getTrialBalanceAction } from '@/core/actions/accounting/get-trial-balance.action'
import type { TrialBalanceResultDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-result.dto'

export interface TrialBalanceFilters {
  fromDate?: string
  toDate?: string
  periodId?: string
  costCenterId?: string
  includeSubaccounts: boolean
  includeZeroBalanceAccounts: boolean
}

interface UseTrialBalanceState {
  data: TrialBalanceResultDto | null
  isLoading: boolean
  error: string | null
}

export const useTrialBalance = () => {
  const [state, setState] = useState<UseTrialBalanceState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (filters: TrialBalanceFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getTrialBalanceAction({
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      periodId: filters.periodId || undefined,
      costCenterId: filters.costCenterId || undefined,
      includeSubaccounts: filters.includeSubaccounts,
      includeZeroBalanceAccounts: filters.includeZeroBalanceAccounts,
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
