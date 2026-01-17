import { useCallback, useState } from 'react'
import { syncCostCentersAction } from '@/core/actions/accounting/sync-cost-centers.action'

export const useSyncCostCenters = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sync = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await syncCostCentersAction()
    if (result.success) {
      setIsLoading(false)
      return { success: true }
    }
    setError(result.error)
    setIsLoading(false)
    return { success: false, error: result.error }
  }, [])

  return {
    sync,
    isLoading,
    error,
  }
}
