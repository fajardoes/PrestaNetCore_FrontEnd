import { useCallback, useEffect, useMemo, useState } from 'react'
import { listChartAccountsAction } from '@/core/actions/accounting/list-chart-accounts.action'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'

const DEFAULT_PAGE_SIZE = 200

interface UsePostableAccountsState {
  items: ChartAccountListItem[]
  isLoading: boolean
  error: string | null
}

export const usePostableAccounts = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UsePostableAccountsState>({
    items: [],
    isLoading: false,
    error: null,
  })
  const [search, setSearch] = useState('')

  const fetchAccounts = useCallback(
    async (term: string) => {
      if (!enabled) {
        setState({ items: [], isLoading: false, error: null })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listChartAccountsAction({
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        search: term.trim() || undefined,
        isActive: true,
      })

      if (result.success) {
        setState({
          items: result.data.items,
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          items: [],
          isLoading: false,
          error: result.error,
        })
      }
    },
    [enabled],
  )

  useEffect(() => {
    void fetchAccounts(search)
  }, [fetchAccounts, search])

  const postableAccounts = useMemo(
    () => state.items.filter((account) => !account.isGroup),
    [state.items],
  )

  return {
    accounts: postableAccounts,
    isLoading: state.isLoading,
    error: state.error,
    search,
    setSearch,
    refresh: () => fetchAccounts(search),
  }
}
