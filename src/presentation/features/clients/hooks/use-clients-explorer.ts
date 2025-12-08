import { useCallback, useEffect, useState } from 'react'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { PagedResult } from '@/types/pagination'

type ActivoFilter = 'all' | 'active' | 'inactive'

interface Filters {
  search: string
  municipioId?: string
  activo: ActivoFilter
}

interface ExplorerState {
  data: PagedResult<ClientListItem> | null
  isLoading: boolean
  error: string | null
}

const PAGE_SIZE = 10

export const useClientsExplorer = () => {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    municipioId: undefined,
    activo: 'active',
  })
  const [page, setPage] = useState(1)
  const [state, setState] = useState<ExplorerState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const fetchClients = useCallback(
    async (pageNumber = page) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const normalizedSearch = normalizeSearch(filters.search)
      const result = await listClientsAction({
        pageNumber,
        pageSize: PAGE_SIZE,
        search: normalizedSearch || undefined,
        municipioId: filters.municipioId || undefined,
        activo:
          filters.activo === 'all'
            ? undefined
            : filters.activo === 'active'
              ? true
              : false,
      })
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null })
      } else {
        setState({ data: null, isLoading: false, error: result.error })
      }
    },
    [filters, page],
  )

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    void fetchClients(page)
  }, [fetchClients, page])

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
    return Math.max(
      1,
      serverTotal ?? derivedFromCount ?? optimisticNextPage ?? 1,
    )
  })()

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const updateActive = (clientId: string, activo: boolean) => {
    setState((prev) => {
      if (!prev.data) return prev
      return {
        ...prev,
        data: {
          ...prev.data,
          items: prev.data.items.map((client) =>
            client.id === clientId ? { ...client, activo } : client,
          ),
        },
      }
    })
  }

  return {
    clients: state.data?.items ?? [],
    page,
    totalPages,
    totalCount: state.data?.totalCount ?? 0,
    isLoading: state.isLoading,
    error: state.error,
    filters,
    setFilters,
    setPage,
    refresh: fetchClients,
    updateActive,
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
