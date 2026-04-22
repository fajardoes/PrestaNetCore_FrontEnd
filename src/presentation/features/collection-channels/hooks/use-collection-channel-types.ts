import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCollectionChannelTypesAction } from '@/core/actions/collection-channels/list-collection-channel-types.action'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'

interface UseCollectionChannelTypesOptions {
  enabled?: boolean
  activeOnly?: boolean
}

export const useCollectionChannelTypes = (options?: UseCollectionChannelTypesOptions) => {
  const enabled = options?.enabled ?? true
  const activeOnly = options?.activeOnly ?? false
  const [items, setItems] = useState<CollectionChannelTypeResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) {
      setItems([])
      setIsLoading(false)
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    const result = await listCollectionChannelTypesAction()
    setIsLoading(false)
    if (result.success) {
      setItems(result.data)
      return
    }
    setItems([])
    setError(result.error)
  }, [enabled])

  useEffect(() => {
    void load()
  }, [load])

  const filteredItems = useMemo(() => {
    const base = activeOnly ? items.filter((item) => item.isActive) : items
    return base.slice().sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
  }, [activeOnly, items])

  return {
    items: filteredItems,
    rawItems: items,
    isLoading,
    error,
    refresh: load,
  }
}
