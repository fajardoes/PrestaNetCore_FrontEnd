import { useCallback, useState } from 'react'
import { getLedgerAction } from '@/core/actions/accounting/get-ledger.action'
import type { LedgerEntry } from '@/infrastructure/interfaces/accounting/ledger-entry'

export interface LedgerFiltersState {
  accountId: string
  fromDate: string
  toDate: string
  costCenterId: string
  includeOpeningBalance: boolean
}

interface UseLedgerState {
  entries: LedgerEntry[]
  openingBalance?: number
  isLoading: boolean
  error: string | null
}

const defaultFilters: LedgerFiltersState = {
  accountId: '',
  fromDate: '',
  toDate: '',
  costCenterId: '',
  includeOpeningBalance: true,
}

export const useLedger = () => {
  const [filters, setFilters] = useState<LedgerFiltersState>(defaultFilters)
  const [state, setState] = useState<UseLedgerState>({
    entries: [],
    openingBalance: undefined,
    isLoading: false,
    error: null,
  })

  const load = useCallback(async () => {
    if (!filters.accountId) {
      setState((prev) => ({
        ...prev,
        entries: [],
        openingBalance: undefined,
        isLoading: false,
        error: null,
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const result = await getLedgerAction({
      accountId: filters.accountId,
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
      costCenterId: filters.costCenterId || undefined,
      includeOpeningBalance: filters.includeOpeningBalance,
    })

    if (result.success) {
      setState({
        entries: result.data.items,
        openingBalance: result.data.openingBalance,
        isLoading: false,
        error: null,
      })
    } else {
      setState({
        entries: [],
        openingBalance: undefined,
        isLoading: false,
        error: result.error,
      })
    }
  }, [filters])

  return {
    filters,
    setFilters,
    entries: state.entries,
    openingBalance: state.openingBalance,
    isLoading: state.isLoading,
    error: state.error,
    reload: load,
    reset: () => setFilters(defaultFilters),
  }
}
