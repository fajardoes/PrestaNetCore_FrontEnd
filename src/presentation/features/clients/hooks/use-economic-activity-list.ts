import { useCallback, useEffect, useState } from 'react'
import { listEconomicActivitiesAction } from '@/core/actions/clients/list-economic-activities.action'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import type { PagedResult } from '@/types/pagination'

interface EconomicActivityState {
  data: PagedResult<EconomicActivityCatalog> | null
  isLoading: boolean
  error: string | null
}

interface UseEconomicActivityListOptions {
  sectorId?: string
  search?: string
  onlyActive?: boolean
  pageSize?: number
}

export const useEconomicActivityList = ({
  sectorId,
  search = '',
  onlyActive,
  pageSize = 10,
}: UseEconomicActivityListOptions) => {
  const [page, setPage] = useState(1)
  const [state, setState] = useState<EconomicActivityState>({
    data: null,
    isLoading: false,
    error: null,
  })

  const fetchActivities = useCallback(
    async (pageNumber = page) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listEconomicActivitiesAction({
        sectorId: sectorId || undefined,
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
    [onlyActive, page, pageSize, search, sectorId],
  )

  useEffect(() => {
    setPage(1)
  }, [sectorId, search, onlyActive, pageSize])

  useEffect(() => {
    void fetchActivities(page)
  }, [fetchActivities, page])

  const totalPages = state.data?.totalPages ?? 1
  const items = state.data?.items ?? []

  return {
    activities: items,
    page,
    totalPages,
    isLoading: state.isLoading,
    error: state.error,
    setPage,
    refresh: fetchActivities,
  }
}
