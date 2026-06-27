import { useCallback, useEffect, useState } from 'react'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { PagedResult } from '@/types/pagination'

interface EmployeeSearchState {
  data: PagedResult<ClientListItem> | null
  isLoading: boolean
  error: string | null
}

const PAGE_SIZE = 10

export const useEmployeeClientsSearch = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [state, setState] = useState<EmployeeSearchState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const fetchEmployees = useCallback(
    async (pageNumber = page) => {
      if (!enabled) {
        setState({ data: null, isLoading: false, error: null })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const normalized = normalizeSearch(search)
      const result = await listClientsAction(
        {
          pageNumber,
          pageSize: PAGE_SIZE,
          search: normalized || undefined,
          activo: true,
          esEmpleado: true,
        },
        { silent: true },
      )

      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null })
      } else {
        setState({ data: null, isLoading: false, error: result.error })
      }
    },
    [enabled, page, search],
  )

  useEffect(() => {
    setPage(1)
  }, [search])

  useEffect(() => {
    void fetchEmployees(page)
  }, [fetchEmployees, page])

  const totalPages = (() => {
    const raw = state.data
    if (!raw) return 1
    const serverTotal =
      typeof raw.totalPages === 'number' && raw.totalPages > 0
        ? raw.totalPages
        : null
    const derivedFromCount =
      raw.totalCount && raw.totalCount > 0
        ? Math.ceil(raw.totalCount / PAGE_SIZE)
        : null
    const optimisticNextPage =
      raw.hasNextPage && !serverTotal && !derivedFromCount ? page + 1 : null
    return Math.max(1, serverTotal ?? derivedFromCount ?? optimisticNextPage ?? 1)
  })()

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const clear = useCallback(() => {
    setSearch('')
    setPage(1)
    if (!enabled) {
      setState({ data: null, isLoading: false, error: null })
      return
    }
  }, [enabled])

  return {
    employees: state.data?.items ?? [],
    page,
    totalPages,
    totalCount: state.data?.totalCount ?? 0,
    search,
    isLoading: state.isLoading,
    error: state.error,
    setSearch,
    setPage,
    refresh: fetchEmployees,
    clear,
  }
}

const normalizeSearch = (value?: string) => {
  if (!value) return undefined
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
