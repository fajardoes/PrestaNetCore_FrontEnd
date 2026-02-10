import { useCallback, useMemo, useState } from 'react'
import type { ApiResult } from '@/core/helpers/api-result'
import type { CollateralCatalogItemCreateRequestDto } from '@/infrastructure/intranet/requests/collaterals/collateral-catalog-item-create-request'
import type { CollateralCatalogItemUpdateRequestDto } from '@/infrastructure/intranet/requests/collaterals/collateral-catalog-item-update-request'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import { createCollateralStatusAction } from '@/core/actions/collaterals/create-collateral-status-action'
import { createCollateralTypeAction } from '@/core/actions/collaterals/create-collateral-type-action'
import { listCollateralStatusesAction } from '@/core/actions/collaterals/list-collateral-statuses-action'
import { listCollateralTypesAction } from '@/core/actions/collaterals/list-collateral-types-action'
import { patchCollateralStatusStatusAction } from '@/core/actions/collaterals/patch-collateral-status-status-action'
import { patchCollateralTypeStatusAction } from '@/core/actions/collaterals/patch-collateral-type-status-action'
import { updateCollateralStatusAction } from '@/core/actions/collaterals/update-collateral-status-action'
import { updateCollateralTypeAction } from '@/core/actions/collaterals/update-collateral-type-action'
import type { CollateralActionErrorData } from '@/core/actions/collaterals/collateral-action-error'

type CatalogKind = 'types' | 'statuses'

interface MutationHandlers {
  list: (active?: boolean) => Promise<ApiResult<CollateralCatalogItemDto[], CollateralActionErrorData>>
  create: (payload: CollateralCatalogItemCreateRequestDto) => Promise<ApiResult<CollateralCatalogItemDto, CollateralActionErrorData>>
  update: (id: string, payload: CollateralCatalogItemUpdateRequestDto) => Promise<ApiResult<CollateralCatalogItemDto, CollateralActionErrorData>>
  toggle: (id: string, isActive: boolean) => Promise<ApiResult<void, CollateralActionErrorData>>
}

const getHandlers = (kind: CatalogKind): MutationHandlers => {
  if (kind === 'types') {
    return {
      list: listCollateralTypesAction,
      create: createCollateralTypeAction,
      update: updateCollateralTypeAction,
      toggle: (id, isActive) => patchCollateralTypeStatusAction(id, { isActive }),
    }
  }

  return {
    list: listCollateralStatusesAction,
    create: createCollateralStatusAction,
    update: updateCollateralStatusAction,
    toggle: (id, isActive) => patchCollateralStatusStatusAction(id, { isActive }),
  }
}

const sortCatalog = (items: CollateralCatalogItemDto[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name, 'es')
  })

export const useCollateralCatalogAdmin = (kind: CatalogKind) => {
  const handlers = useMemo(() => getHandlers(kind), [kind])

  const [items, setItems] = useState<CollateralCatalogItemDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (active?: boolean) => {
    setIsLoading(true)
    setError(null)

    const result = await handlers.list(active)
    if (result.success) {
      setItems(sortCatalog(result.data))
      setIsLoading(false)
      return result
    }

    setItems([])
    setError(result.error)
    setIsLoading(false)
    return result
  }, [handlers])

  const create = useCallback(
    async (payload: CollateralCatalogItemCreateRequestDto) => {
      setIsSaving(true)
      setError(null)

      const result = await handlers.create(payload)
      if (!result.success) {
        setError(result.error)
      }

      setIsSaving(false)
      return result
    },
    [handlers],
  )

  const update = useCallback(
    async (id: string, payload: CollateralCatalogItemUpdateRequestDto) => {
      setIsSaving(true)
      setError(null)

      const result = await handlers.update(id, payload)
      if (!result.success) {
        setError(result.error)
      }

      setIsSaving(false)
      return result
    },
    [handlers],
  )

  const toggleStatus = useCallback(
    async (id: string, isActive: boolean) => {
      setIsSaving(true)
      setError(null)

      const result = await handlers.toggle(id, isActive)
      if (!result.success) {
        setError(result.error)
      }

      setIsSaving(false)
      return result
    },
    [handlers],
  )

  return {
    items,
    isLoading,
    isSaving,
    error,
    load,
    create,
    update,
    toggleStatus,
    clearError: () => setError(null),
  }
}
