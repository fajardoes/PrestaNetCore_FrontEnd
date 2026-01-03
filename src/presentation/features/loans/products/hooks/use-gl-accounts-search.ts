import { useCallback, useRef, useState } from 'react'
import { listChartAccountsAction } from '@/core/actions/accounting/list-chart-accounts.action'
import { getChartAccountAction } from '@/core/actions/accounting/get-chart-account.action'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'

const PAGE_SIZE = 20
const TOP_CACHE_KEY = '__top__'

export const useGlAccountsSearch = () => {
  const cacheRef = useRef(new Map<string, ChartAccountListItem[]>())
  const accountCacheRef = useRef(new Map<string, ChartAccountListItem>())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchAccounts = useCallback(async (query: string) => {
    const normalized = query.trim()
    const cacheKey = normalized || TOP_CACHE_KEY

    const cached = cacheRef.current.get(cacheKey)
    if (cached) {
      return cached
    }

    setIsLoading(true)
    setError(null)
    const result = await listChartAccountsAction({
      page: 1,
      pageSize: PAGE_SIZE,
      search: normalized || undefined,
      isActive: true,
    })

    if (result.success) {
      cacheRef.current.set(cacheKey, result.data.items)
      result.data.items.forEach((item) => {
        accountCacheRef.current.set(item.id, item)
      })
      setIsLoading(false)
      return result.data.items
    }

    setIsLoading(false)
    setError(result.error)
    return []
  }, [])

  const getAccountById = useCallback(async (accountId: string) => {
    const cached = accountCacheRef.current.get(accountId)
    if (cached) return cached

    setIsLoading(true)
    setError(null)
    const result = await getChartAccountAction(accountId)
    if (result.success) {
      const mapped: ChartAccountListItem = {
        id: result.data.id,
        code: result.data.code,
        name: result.data.name,
        slug: result.data.slug,
        level: result.data.level,
        parentId: result.data.parentId,
        isGroup: result.data.isGroup,
        normalBalance: result.data.normalBalance,
        isActive: result.data.isActive,
      }
      accountCacheRef.current.set(accountId, mapped)
      setIsLoading(false)
      return mapped
    }

    setIsLoading(false)
    setError(result.error)
    return null
  }, [])

  return {
    searchAccounts,
    getAccountById,
    isLoading,
    error,
  }
}
