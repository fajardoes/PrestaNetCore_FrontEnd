import { useCallback, useEffect, useState } from 'react'
import { getLoanDisbursementAccountSettingAction } from '@/core/actions/system/get-loan-disbursement-account-setting.action'
import { updateLoanDisbursementAccountSettingAction } from '@/core/actions/system/update-loan-disbursement-account-setting.action'
import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'

export const useLoanDisbursementAccount = () => {
  const [state, setState] = useState<LoanDisbursementAccountSettingDto | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getLoanDisbursementAccountSettingAction()
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

  const updateSetting = useCallback(
    async (loanDisbursementGlAccountId: string | null) => {
      setIsSaving(true)
      setError(null)

      const result = await updateLoanDisbursementAccountSettingAction({
        loanDisbursementGlAccountId,
      })

      if (!result.success) {
        setError(result.error)
        setIsSaving(false)
        return false
      }

      setState(result.data)
      setIsSaving(false)
      return true
    },
    [],
  )

  return {
    state,
    isLoading,
    isSaving,
    error,
    refresh,
    updateSetting,
  }
}
