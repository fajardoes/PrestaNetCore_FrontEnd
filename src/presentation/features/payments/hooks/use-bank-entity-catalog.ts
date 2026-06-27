import { useCallback, useRef, useState } from 'react'
import { getBankEntityAction } from '@/core/actions/payments/get-bank-entity.action'
import { listBankEntitiesAction } from '@/core/actions/payments/list-bank-entities.action'
import type { ListBankEntitiesRequest } from '@/infrastructure/payments/requests/list-bank-entities-request'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

const TOP_CACHE_KEY = '__top__'

const toCacheKey = (params: ListBankEntitiesRequest) =>
  `${params.search?.trim().toLowerCase() || TOP_CACHE_KEY}|${
    typeof params.isActive === 'boolean' ? String(params.isActive) : 'all'
  }`

export const useBankEntityCatalog = () => {
  const cacheRef = useRef(new Map<string, BankEntityResponse[]>())
  const entityCacheRef = useRef(new Map<string, BankEntityResponse>())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadBankEntities = useCallback(async (params: ListBankEntitiesRequest) => {
    const normalizedParams: ListBankEntitiesRequest = {
      search: params.search?.trim() || undefined,
      isActive: params.isActive,
    }
    const cacheKey = toCacheKey(normalizedParams)
    const cached = cacheRef.current.get(cacheKey)
    if (cached) return cached

    setIsLoading(true)
    setError(null)
    const result = await listBankEntitiesAction(normalizedParams)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error)
      return [] as BankEntityResponse[]
    }

    cacheRef.current.set(cacheKey, result.data)
    result.data.forEach((item) => entityCacheRef.current.set(item.id, item))
    return result.data
  }, [])

  const getBankEntityById = useCallback(async (id: string) => {
    const normalizedId = id.trim()
    if (!normalizedId) return null

    const cached = entityCacheRef.current.get(normalizedId)
    if (cached) return cached

    setIsLoading(true)
    setError(null)
    const result = await getBankEntityAction(normalizedId)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error)
      return null
    }

    entityCacheRef.current.set(result.data.id, result.data)
    return result.data
  }, [])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
    entityCacheRef.current.clear()
  }, [])

  return {
    isLoading,
    error,
    setError,
    loadBankEntities,
    getBankEntityById,
    clearCache,
  }
}
