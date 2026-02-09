import { useCallback, useState } from 'react'
import { getCollateralAction } from '@/core/actions/collaterals/get-collateral-action'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'

export const useCollateralDetail = () => {
  const [collateral, setCollateral] = useState<CollateralResponseDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadById = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    const result = await getCollateralAction(id)
    if (result.success) {
      setCollateral(result.data)
      setIsLoading(false)
      return result
    }

    setCollateral(null)
    setError(result.error)
    setIsLoading(false)
    return result
  }, [])

  return {
    collateral,
    isLoading,
    error,
    loadById,
    clear: () => {
      setCollateral(null)
      setError(null)
      setIsLoading(false)
    },
  }
}
