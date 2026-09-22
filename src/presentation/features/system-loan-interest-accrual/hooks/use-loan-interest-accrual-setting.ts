import { useCallback, useEffect, useState } from 'react'
import { getLoanInterestAccrualSettingAction } from '@/core/actions/system/get-loan-interest-accrual-setting.action'
import { updateLoanInterestAccrualSettingAction } from '@/core/actions/system/update-loan-interest-accrual-setting.action'
import type { LoanInterestAccrualSettingDto } from '@/infrastructure/interfaces/system/loan-interest-accrual-setting.dto'
import type { UpdateLoanInterestAccrualSettingRequest } from '@/infrastructure/interfaces/system/update-loan-interest-accrual-setting.request'

export const useLoanInterestAccrualSetting = (enabled = true) => {
  const [state, setState] = useState<LoanInterestAccrualSettingDto | null>(null)
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
    const result = await getLoanInterestAccrualSettingAction()
    if (result.success) {
      setState(result.data)
      setIsLoading(false)
      return
    }

    setError(result.error)
    setIsLoading(false)
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const updateSetting = useCallback(async (payload: UpdateLoanInterestAccrualSettingRequest) => {
    if (!enabled) return false

    setIsSaving(true)
    setError(null)
    const result = await updateLoanInterestAccrualSettingAction(payload)
    if (!result.success) {
      setError(result.error)
      setIsSaving(false)
      return false
    }

    setState(result.data)
    setIsSaving(false)
    return true
  }, [enabled])

  return { state, isLoading, isSaving, error, refresh, updateSetting }
}
