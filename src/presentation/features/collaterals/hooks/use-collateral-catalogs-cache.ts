import { useCallback, useEffect, useRef, useState } from 'react'
import { listCollateralStatusesAction } from '@/core/actions/collaterals/list-collateral-statuses-action'
import { listCollateralTypesAction } from '@/core/actions/collaterals/list-collateral-types-action'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'

interface CollateralCatalogsCacheState {
  types: CollateralCatalogItemDto[]
  statuses: CollateralCatalogItemDto[]
  isLoading: boolean
  error: string | null
}

const sortCatalog = (items: CollateralCatalogItemDto[]) =>
  [...items].sort((a, b) => {
    const byOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (byOrder !== 0) return byOrder
    return a.name.localeCompare(b.name, 'es')
  })

const initialState: CollateralCatalogsCacheState = {
  types: [],
  statuses: [],
  isLoading: false,
  error: null,
}

export const useCollateralCatalogsCache = () => {
  const cacheRef = useRef<{ types: CollateralCatalogItemDto[]; statuses: CollateralCatalogItemDto[] } | null>(null)
  const [state, setState] = useState<CollateralCatalogsCacheState>(initialState)

  const load = useCallback(async (force = false) => {
    if (!force && cacheRef.current) {
      setState({
        types: cacheRef.current.types,
        statuses: cacheRef.current.statuses,
        isLoading: false,
        error: null,
      })
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const [typesResult, statusesResult] = await Promise.all([
      listCollateralTypesAction(true),
      listCollateralStatusesAction(true),
    ])

    if (typesResult.success && statusesResult.success) {
      const next = {
        types: sortCatalog(typesResult.data),
        statuses: sortCatalog(statusesResult.data),
      }
      cacheRef.current = next
      setState({ ...next, isLoading: false, error: null })
      return
    }

    const nextError = !typesResult.success
      ? typesResult.error
      : !statusesResult.success
        ? statusesResult.error
        : 'No fue posible cargar los catálogos de garantías.'

    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: nextError,
    }))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    reload: () => load(true),
  }
}
