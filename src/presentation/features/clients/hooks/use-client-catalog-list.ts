import { useCallback, useEffect, useState } from 'react'
import { listClientCatalogsAction } from '@/core/actions/clients/list-client-catalogs.action'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'
import type { PagedResult } from '@/types/pagination'

interface CatalogListState {
  data: PagedResult<ClientCatalogItem> | null
  isLoading: boolean
  error: string | null
}

interface UseClientCatalogListOptions {
  parentSlug: string
  search?: string
  onlyActive?: boolean
  pageSize?: number
}

export const useClientCatalogList = ({
  parentSlug,
  search = '',
  onlyActive,
  pageSize = 10,
}: UseClientCatalogListOptions) => {
  const [page, setPage] = useState(1)
  const [state, setState] = useState<CatalogListState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const fetchCatalogs = useCallback(
    async (pageNumber = page) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listClientCatalogsAction({
        parentSlug,
        search: search.trim() || undefined,
        onlyActive,
        pageNumber,
        pageSize,
      })
      if (result.success) {
        setState({ data: result.data, isLoading: false, error: null })
      } else {
        setState({ data: null, isLoading: false, error: result.error })
      }
    },
    [onlyActive, page, pageSize, parentSlug, search],
  )

  useEffect(() => {
    setPage(1)
  }, [parentSlug, search, onlyActive, pageSize])

  useEffect(() => {
    void fetchCatalogs(page)
  }, [fetchCatalogs, page])

  const totalPages = state.data?.totalPages ?? 1
  const items = state.data?.items ?? []

  return {
    catalogs: items,
    page,
    totalPages,
    isLoading: state.isLoading,
    error: state.error,
    setPage,
    refresh: fetchCatalogs,
  }
}
