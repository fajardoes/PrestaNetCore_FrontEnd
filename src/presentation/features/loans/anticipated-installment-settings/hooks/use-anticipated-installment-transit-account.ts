import { useCallback, useEffect, useState } from 'react'
import {
  getAnticipatedInstallmentTransitAccountSettingAction,
  updateAnticipatedInstallmentTransitAccountSettingAction,
} from '@/core/actions/system/anticipated-installment-transit-account.action'
import type { AnticipatedInstallmentTransitAccountSettingDto } from '@/infrastructure/interfaces/system/anticipated-installment-transit-account-setting.dto'

export const useAnticipatedInstallmentTransitAccount = (enabled: boolean) => {
  const [state, setState] = useState<AnticipatedInstallmentTransitAccountSettingDto | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled) {
      setState(null)
      setIsLoading(false)
      setError(null)
      return
    }
    setIsLoading(true)
    setError(null)
    const result = await getAnticipatedInstallmentTransitAccountSettingAction()
    setIsLoading(false)
    if (result.success) setState(result.data)
    else setError(result.error)
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const update = useCallback(async (accountId: string | null) => {
    setIsSaving(true)
    setError(null)
    const result = await updateAnticipatedInstallmentTransitAccountSettingAction({
      anticipatedInstallmentTransitGlAccountId: accountId,
    })
    setIsSaving(false)
    if (result.success) setState(result.data)
    else setError(result.error)
    return result
  }, [])

  return { state, isLoading, isSaving, error, update }
}
