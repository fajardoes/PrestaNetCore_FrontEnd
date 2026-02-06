import { useCallback, useEffect, useState } from 'react'
import { getBusinessDateAction } from '@/core/actions/system/get-business-date-action'
import { setBusinessDateAction } from '@/core/actions/system/set-business-date-action'
import { setBusinessDayStatusAction } from '@/core/actions/system/set-business-day-status-action'
import type { BusinessDateStateDto } from '@/infrastructure/interfaces/system/business-date-state.dto'

export const useBusinessDate = () => {
  const [state, setState] = useState<BusinessDateStateDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getBusinessDateAction()
    if (result.success) {
      setState(result.data)
      setIsLoading(false)
      return
    }
    setError(result.error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateBusinessDate = useCallback(async (date: string) => {
    setIsLoading(true)
    setError(null)
    const result = await setBusinessDateAction({ businessDate: date })
    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return false
    }
    setState(result.data)
    await refresh()
    return true
  }, [refresh])

  const setDayOpen = useCallback(async (isOpen: boolean) => {
    setIsLoading(true)
    setError(null)
    const result = await setBusinessDayStatusAction({ isDayOpen: isOpen })
    if (!result.success) {
      setError(result.error)
      setIsLoading(false)
      return false
    }
    setState(result.data)
    await refresh()
    return true
  }, [refresh])

  return {
    state,
    isLoading,
    error,
    refresh,
    updateBusinessDate,
    setDayOpen,
  }
}
