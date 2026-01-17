import { useCallback, useState } from 'react'
import { listLoanCatalogItemsAction } from '@/core/actions/loans/list-loan-catalog-items.action'
import { createLoanCatalogItemAction } from '@/core/actions/loans/create-loan-catalog-item.action'
import { updateLoanCatalogItemAction } from '@/core/actions/loans/update-loan-catalog-item.action'
import { updateLoanCatalogStatusAction } from '@/core/actions/loans/update-loan-catalog-status.action'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanCatalogCreateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-create.dto'
import type { LoanCatalogUpdateDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-update.dto'
import type { LoanCatalogListQueryDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-list-query.dto'
import type { LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'
import type { ApiResult } from '@/core/helpers/api-result'

const sortCatalogItems = (items: LoanCatalogItemDto[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name)
  })

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 409) {
    return 'El código ya existe.'
  }
  return result.error
}

export const useLoanCatalog = (catalogKey: LoanCatalogKey) => {
  const [items, setItems] = useState<LoanCatalogItemDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (query?: LoanCatalogListQueryDto) => {
      setIsLoading(true)
      setError(null)
      const result = await listLoanCatalogItemsAction(catalogKey, query)
      if (result.success) {
        setItems(sortCatalogItems(result.data))
        setIsLoading(false)
        return result
      }
      setIsLoading(false)
      setError(mapErrorMessage(result))
      return result
    },
    [catalogKey],
  )

  const create = useCallback(
    async (payload: LoanCatalogCreateDto) => {
      setIsSaving(true)
      setError(null)
      const result = await createLoanCatalogItemAction(catalogKey, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [catalogKey],
  )

  const update = useCallback(
    async (id: string, payload: LoanCatalogUpdateDto) => {
      setIsSaving(true)
      setError(null)
      const result = await updateLoanCatalogItemAction(catalogKey, id, payload)
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [catalogKey],
  )

  const toggleStatus = useCallback(
    async (id: string, isActive: boolean) => {
      setIsSaving(true)
      setError(null)
      const result = await updateLoanCatalogStatusAction(catalogKey, id, {
        isActive,
      })
      if (!result.success) {
        setError(mapErrorMessage(result))
      }
      setIsSaving(false)
      return result
    },
    [catalogKey],
  )

  const clearError = () => setError(null)

  return {
    items,
    isLoading,
    isSaving,
    error,
    load,
    create,
    update,
    toggleStatus,
    clearError,
  }
}
