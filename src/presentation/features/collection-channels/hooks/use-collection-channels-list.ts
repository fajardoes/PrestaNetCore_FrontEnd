import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCollectionChannelsAction } from '@/core/actions/collection-channels/list-collection-channels.action'
import type { ListCollectionChannelsRequest } from '@/infrastructure/collection-channels/requests/list-collection-channels-request'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'

interface UseCollectionChannelsListOptions {
  enabled?: boolean
}

interface UseCollectionChannelsListState {
  items: CollectionChannelResponse[]
  totalCount: number
  pageNumber: number
  pageSize: number
  isLoading: boolean
  error: string | null
}

const DEFAULT_PAGE_SIZE = 25

export const useCollectionChannelsList = (options?: UseCollectionChannelsListOptions) => {
  const enabled = options?.enabled ?? true
  const [filters, setFilters] = useState<ListCollectionChannelsRequest>({
    active: true,
    take: DEFAULT_PAGE_SIZE,
    skip: 0,
  })
  const [state, setState] = useState<UseCollectionChannelsListState>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    isLoading: false,
    error: null,
  })

  const page = useMemo(() => {
    const take = filters.take ?? DEFAULT_PAGE_SIZE
    const skip = filters.skip ?? 0
    return Math.floor(skip / take) + 1
  }, [filters.skip, filters.take])

  const take = filters.take ?? DEFAULT_PAGE_SIZE

  const load = useCallback(
    async (nextFilters: ListCollectionChannelsRequest) => {
      if (!enabled) {
        setState({
          items: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: take,
          isLoading: false,
          error: null,
        })
        return
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      const result = await listCollectionChannelsAction(nextFilters)
      if (result.success) {
        setState({
          items: result.data.items,
          totalCount: result.data.totalCount,
          pageNumber: result.data.pageNumber,
          pageSize: result.data.pageSize,
          isLoading: false,
          error: null,
        })
        return
      }

      setState((prev) => ({
        ...prev,
        items: [],
        totalCount: 0,
        isLoading: false,
        error: result.error,
      }))
    },
    [enabled, take],
  )

  useEffect(() => {
    void load(filters)
  }, [filters, load])

  const applyFilters = useCallback((nextFilters: Omit<ListCollectionChannelsRequest, 'skip' | 'take'>) => {
    setFilters((prev) => ({
      ...prev,
      ...nextFilters,
      skip: 0,
    }))
  }, [])

  const setPage = useCallback((nextPage: number) => {
    setFilters((prev) => ({
      ...prev,
      skip: Math.max(0, (Math.max(1, nextPage) - 1) * (prev.take ?? DEFAULT_PAGE_SIZE)),
    }))
  }, [])

  const setTake = useCallback((nextTake: number) => {
    setFilters((prev) => ({
      ...prev,
      take: nextTake,
      skip: 0,
    }))
  }, [])

  const refresh = useCallback(async () => {
    await load(filters)
  }, [filters, load])

  const totalPages = Math.max(1, Math.ceil(state.totalCount / (state.pageSize || DEFAULT_PAGE_SIZE)))

  return {
    items: state.items,
    totalCount: state.totalCount,
    totalPages,
    page,
    take,
    filters,
    isLoading: state.isLoading,
    error: state.error,
    applyFilters,
    setPage,
    setTake,
    refresh,
  }
}
