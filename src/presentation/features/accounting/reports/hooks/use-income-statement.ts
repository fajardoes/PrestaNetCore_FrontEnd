import { useCallback, useState } from 'react'
import { getIncomeStatementAction } from '@/core/actions/accounting/get-income-statement.action'
import type { IncomeStatementResultDto } from '@/infrastructure/accounting/dtos/reports/income-statement-result.dto'

export interface IncomeStatementFilters {
  fromDate?: string
  toDate?: string
  periodId?: string
  costCenterId?: string
}

interface UseIncomeStatementState {
  data: IncomeStatementResultDto | null
  isLoading: boolean
  error: string | null
}

export const useIncomeStatement = () => {
  const [state, setState] = useState<UseIncomeStatementState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async (filters: IncomeStatementFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getIncomeStatementAction({
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
