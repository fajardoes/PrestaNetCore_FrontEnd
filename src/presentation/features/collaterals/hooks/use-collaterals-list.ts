import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCollateralsAction } from '@/core/actions/collaterals/list-collaterals-action'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'

interface CollateralsFilters {
  ownerClientId?: string
  typeId?: string
  statusId?: string
  active?: boolean
  search?: string
}

const DEFAULT_PAGE_SIZE = 20

export const useCollateralsList = () => {
  const [items, setItems] = useState<CollateralResponseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<CollateralsFilters>({
    active: true,
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [totalCount, setTotalCount] = useState(0)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const skip = (page - 1) * pageSize

    const result = await listCollateralsAction({
      ...filters,
      search: filters.search?.trim() || undefined,
      skip,
      take: pageSize,
    })

    if (result.success) {
      setItems(result.data.items)
      setTotalCount(result.data.totalCount)
      setIsLoading(false)
      return
    }

    setItems([])
    setTotalCount(0)
    setError(result.error)
    setIsLoading(false)
  }, [filters, page, pageSize])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = useMemo(() => {
    if (!totalCount) return 1
    return Math.max(1, Math.ceil(totalCount / pageSize))
  }, [pageSize, totalCount])

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const applyFilters = useCallback((next: CollateralsFilters) => {
    setFilters(next)
    setPage(1)
  }, [])

  return {
    items,
    isLoading,
    error,
    filters,
    page,
    pageSize,
    totalPages,
    totalCount,
    setPage,
    setPageSize,
    applyFilters,
    refresh: load,
  }
}
