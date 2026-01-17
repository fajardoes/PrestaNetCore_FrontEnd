import { useCallback, useEffect, useMemo, useState } from 'react'
import { listChartAccountsAction } from '@/core/actions/accounting/list-chart-accounts.action'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

interface UseChartAccountsState {
  items: ChartAccountListItem[]
  totalPages: number
  totalCount: number
  isLoading: boolean
  error: string | null
}

interface ChildState {
  items: ChartAccountListItem[]
  isLoading: boolean
  error: string | null
  loaded: boolean
}

export const useChartAccounts = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseChartAccountsState>({
    items: [],
    totalPages: 1,
    totalCount: 0,
    isLoading: false,
    error: null,
  })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('active')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [children, setChildren] = useState<Record<string, ChildState>>({})
  const pageSize = 1000
  const rootAccounts = useMemo(() => {
    const allIds = new Set(state.items.map((item) => item.id))
    return state.items.filter((item) => {
      if (!item.parentId) return true
      return !allIds.has(item.parentId)
    })
  }, [state.items])

  const fetchAccounts = useCallback(
    async (pageNumber: number) => {
      if (!enabled) {
        setState({
          items: [],
          totalPages: 1,
          totalCount: 0,
          isLoading: false,
          error: null,
        })
        return
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listChartAccountsAction({
        page: pageNumber,
        pageSize,
        search: search.trim() || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      })

      if (result.success) {
        setState({
          items: result.data.items,
          totalPages: 1,
          totalCount: result.data.totalCount,
          isLoading: false,
          error: null,
        })
      } else {
        setState({
          items: [],
          totalPages: 1,
          totalCount: 0,
          isLoading: false,
          error: result.error,
        })
      }
    },
    [enabled, pageSize, search, statusFilter],
  )

  const fetchChildren = useCallback(
    async (parentId: string) => {
      if (!enabled) return
      setChildren((prev) => ({
        ...prev,
        [parentId]: {
          items: prev[parentId]?.items ?? [],
          isLoading: true,
          error: null,
          loaded: prev[parentId]?.loaded ?? false,
        },
      }))

      const result = await listChartAccountsAction({
        page: 1,
        pageSize: 100,
        search: search.trim() || undefined,
        parentId,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      })

      setChildren((prev) => ({
        ...prev,
        [parentId]: result.success
          ? {
              items: result.data.items,
              isLoading: false,
              error: null,
              loaded: true,
            }
          : {
              items: [],
              isLoading: false,
              error: result.error,
              loaded: false,
            },
      }))
    },
    [enabled, search, statusFilter],
  )

  useEffect(() => {
    setPage(1)
    setExpandedIds(new Set())
    setChildren({})
  }, [search, statusFilter, pageSize])

  useEffect(() => {
    void fetchAccounts(page)
  }, [page, fetchAccounts])

  const toggleExpand = useCallback(
    async (accountId: string, isGroup: boolean) => {
      if (!isGroup) return
      if (expandedIds.has(accountId)) {
        setExpandedIds((prev) => {
          const next = new Set(prev)
          next.delete(accountId)
          return next
        })
        return
      }
      if (!children[accountId]?.loaded && !children[accountId]?.isLoading) {
        await fetchChildren(accountId)
      }
      setExpandedIds((prev) => new Set(prev).add(accountId))
    },
    [children, expandedIds, fetchChildren],
  )

  const parentOptions = useMemo(() => {
    const candidates = new Map<string, ChartAccountListItem>()
    state.items.forEach((account) => {
      if (account.isGroup) {
        candidates.set(account.id, account)
      }
    })
    Object.values(children).forEach((childState) => {
      childState.items.forEach((item) => {
        if (item.isGroup) {
          candidates.set(item.id, item)
        }
      })
    })
    return Array.from(candidates.values()).sort((a, b) => a.code.localeCompare(b.code))
  }, [children, state.items])

  return {
    chartAccounts: state.items,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    page,
    pageSize,
    isLoading: state.isLoading,
    error: state.error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setPage,
    refresh: () => fetchAccounts(page),
    resetTree: () => {
      setExpandedIds(new Set())
      setChildren({})
    },
    expandedIds,
    toggleExpand,
    children,
    parentOptions,
    rootAccounts,
  }
}
