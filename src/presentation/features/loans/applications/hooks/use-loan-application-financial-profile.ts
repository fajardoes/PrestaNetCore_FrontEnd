import { useCallback, useState } from 'react'
import { GetLoanApplicationFinancialProfileAction } from '@/core/actions/loan-applications/get-loan-application-financial-profile.action'
import { SaveLoanApplicationFinancialProfileAction } from '@/core/actions/loan-applications/save-loan-application-financial-profile.action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationFinancialProfileUpsertRequest } from '@/infrastructure/loans/requests/loan-application-financial-profile-upsert-request'
import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'

interface LoanApplicationFinancialProfileState {
  profile: LoanApplicationFinancialProfileResponse | null
  isLoading: boolean
  isSaving: boolean
  isMissing: boolean
  isForbidden: boolean
  error: string | null
  saveError: string | null
}

const mapLoadErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 403) {
    return 'No tienes permisos para consultar la ficha financiera.'
  }
  if (result.status === 404) {
    return null
  }
  return result.error
}

const mapSaveErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 403) {
    return 'No tienes permisos para guardar la ficha financiera.'
  }
  if (result.status === 409) {
    return 'La solicitud ya no está en borrador. No se puede modificar la ficha financiera.'
  }
  if (result.status === 422) {
    return result.error || 'La ficha financiera contiene una inconsistencia que impidió guardarla.'
  }
  if (result.status === 400) {
    return result.error || 'Revisa los datos de la ficha financiera antes de guardar.'
  }
  return result.error
}

export const useLoanApplicationFinancialProfile = () => {
  const [state, setState] = useState<LoanApplicationFinancialProfileState>({
    profile: null,
    isLoading: false,
    isSaving: false,
    isMissing: false,
    isForbidden: false,
    error: null,
    saveError: null,
  })

  const load = useCallback(async (loanApplicationId: string) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      saveError: null,
      isForbidden: false,
      isMissing: false,
    }))

    const result = await new GetLoanApplicationFinancialProfileAction().execute(loanApplicationId)
    if (result.success) {
      setState((prev) => ({
        ...prev,
        profile: result.data,
        isLoading: false,
        isMissing: false,
        isForbidden: false,
        error: null,
      }))
      return result
    }

    setState((prev) => ({
      ...prev,
      profile: null,
      isLoading: false,
      isMissing: result.status === 404,
      isForbidden: result.status === 403,
      error: mapLoadErrorMessage(result),
    }))
    return result
  }, [])

  const save = useCallback(
    async (
      loanApplicationId: string,
      payload: LoanApplicationFinancialProfileUpsertRequest,
    ): Promise<ApiResult<LoanApplicationFinancialProfileResponse>> => {
      setState((prev) => ({ ...prev, isSaving: true, saveError: null }))
      const result = await new SaveLoanApplicationFinancialProfileAction().execute(
        loanApplicationId,
        payload,
      )
      setState((prev) => ({
        ...prev,
        profile: result.success ? result.data : prev.profile,
        isSaving: false,
        isMissing: result.success ? false : prev.isMissing,
        saveError: result.success ? null : mapSaveErrorMessage(result),
      }))
      return result
    },
    [],
  )

  const clearSaveError = useCallback(() => {
    setState((prev) => ({ ...prev, saveError: null }))
  }, [])

  return {
    ...state,
    load,
    save,
    clearSaveError,
  }
}
