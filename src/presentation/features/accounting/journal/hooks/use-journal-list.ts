import { useCallback, useEffect, useState } from 'react'
import { listJournalEntriesAction } from '@/core/actions/accounting/list-journal-entries.action'
import type { JournalEntryListItem, JournalEntrySource, JournalEntryState } from '@/infrastructure/interfaces/accounting/journal-entry'

const DEFAULT_PAGE_SIZE = 10

export type JournalStateFilter = JournalEntryState | 'all'
export type JournalSourceFilter = JournalEntrySource | 'all'

export interface JournalFiltersState {
  fromDate: string
  toDate: string
  periodId: string
  state: JournalStateFilter
  source: JournalSourceFilter
  search: string
}

interface UseJournalListState {
  items: JournalEntryListItem[]
  totalPages: number
  totalCount: number
  isLoading: boolean
  error: string | null
}

const defaultFilters: JournalFiltersState = {
  fromDate: '',
  toDate: '',
  periodId: '',
  state: 'all',
  source: 'all',
  search: '',
}

export const useJournalList = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [state, setState] = useState<UseJournalListState>({
    items: [],
    totalPages: 1,
    totalCount: 0,
    isLoading: false,
    error: null,
  })
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<JournalFiltersState>(defaultFilters)
  const pageSize = DEFAULT_PAGE_SIZE

  const fetchEntries = useCallback(
    async (pageNumber: number, nextFilters: JournalFiltersState) => {
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
      const result = await listJournalEntriesAction({
        page: pageNumber,
        pageSize,
        fromDate: nextFilters.fromDate || undefined,
        toDate: nextFilters.toDate || undefined,
        periodId: nextFilters.periodId || undefined,
        state: nextFilters.state === 'all' ? undefined : nextFilters.state,
        source: nextFilters.source === 'all' ? undefined : nextFilters.source,
        search: nextFilters.search.trim() || undefined,
      })

      if (result.success) {
        const totalPages = Math.max(
          1,
          Math.ceil(result.data.totalCount / pageSize),
        )
        setState({
          items: result.data.items,
          totalPages,
          totalCount: result.data.totalCount,
          isLoading: false,
          error: null,
        })
        setPage((prevPage) => Math.min(prevPage, totalPages))
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
    [enabled, pageSize],
  )

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    void fetchEntries(page, filters)
  }, [page, filters, fetchEntries])

  return {
    entries: state.items,
    totalPages: state.totalPages,
    totalCount: state.totalCount,
    page,
    pageSize,
    isLoading: state.isLoading,
    error: state.error,
    filters,
    setFilters,
    setPage,
    resetFilters: () => setFilters(defaultFilters),
    refresh: () => fetchEntries(page, filters),
  }
}
