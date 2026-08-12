import { useCallback, useState } from 'react'
import { AddLoanApplicationCollateralAction } from '@/core/actions/loan-applications/add-loan-application-collateral.action'
import { ApproveLoanApplicationAction } from '@/core/actions/loan-applications/approve-loan-application.action'
import { CancelLoanApplicationAction } from '@/core/actions/loan-applications/cancel-loan-application.action'
import { CreateLoanApplicationAction } from '@/core/actions/loan-applications/create-loan-application.action'
import { DisburseLoanApplicationAction } from '@/core/actions/loan-applications/disburse-loan-application.action'
import { PreviewLoanApplicationScheduleAction } from '@/core/actions/loan-applications/preview-loan-application-schedule.action'
import { RejectLoanApplicationAction } from '@/core/actions/loan-applications/reject-loan-application.action'
import { RemoveLoanApplicationCollateralAction } from '@/core/actions/loan-applications/remove-loan-application-collateral.action'
import { ReturnLoanApplicationToDraftAction } from '@/core/actions/loan-applications/return-loan-application-to-draft.action'
import { SaveLoanApplicationFeeOverridesAction } from '@/core/actions/loan-applications/save-loan-application-fee-overrides.action'
import { setLoanApplicationFirstDueDateAction } from '@/core/actions/loan-applications/set-loan-application-first-due-date.action'
import { SubmitLoanApplicationAction } from '@/core/actions/loan-applications/submit-loan-application.action'
import { UpdateLoanApplicationAction } from '@/core/actions/loan-applications/update-loan-application.action'
import type { ApiResult } from '@/core/helpers/api-result'
import type { LoanApplicationApproveRequest } from '@/infrastructure/loans/requests/loan-application-approve-request'
import type { LoanApplicationCancelRequest } from '@/infrastructure/loans/requests/loan-application-cancel-request'
import type { LoanApplicationCollateralAddRequest } from '@/infrastructure/loans/requests/loan-application-collateral-add-request'
import type { LoanApplicationCreateRequest } from '@/infrastructure/loans/requests/loan-application-create-request'
import type { LoanApplicationDisburseRequest } from '@/infrastructure/loans/requests/loan-application-disburse-request'
import type { LoanApplicationFeeOverridesUpsertRequest } from '@/infrastructure/loans/requests/loan-application-fee-overrides-upsert-request'
import type { LoanApplicationFirstDueDateRequest } from '@/infrastructure/loans/requests/loan-application-first-due-date-request'
import type { LoanApplicationRejectRequest } from '@/infrastructure/loans/requests/loan-application-reject-request'
import type { LoanApplicationReturnToDraftRequest } from '@/infrastructure/loans/requests/loan-application-return-to-draft-request'
import type { LoanApplicationSubmitRequest } from '@/infrastructure/loans/requests/loan-application-submit-request'
import type { LoanApplicationUpdateRequest } from '@/infrastructure/loans/requests/loan-application-update-request'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'
import type { LoanSchedulePreviewRequest } from '@/infrastructure/loans/requests/loan-schedule-preview-request'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'

interface LoanApplicationMutationsState {
  isSaving: boolean
  isWorkflowRunning: boolean
  isCollateralSaving: boolean
  isPreviewLoading: boolean
  isFeeSaving: boolean
  error: string | null
}

const mapErrorMessage = (result: ApiResult<unknown>) => {
  if (result.success) return null
  if (result.status === 403) {
    return 'No autorizado para ejecutar esta acción.'
  }
  if (result.status === 400) {
    return result.error || 'No se pudo completar la acción por validación.'
  }
  if (result.status === 409) {
    return result.error || 'Conflicto de estado: la acción no es válida en el estado actual.'
  }
  return result.error
}

export const useLoanApplicationMutations = () => {
  const [state, setState] = useState<LoanApplicationMutationsState>({
    isSaving: false,
    isWorkflowRunning: false,
    isCollateralSaving: false,
    isPreviewLoading: false,
    isFeeSaving: false,
    error: null,
  })

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])

  const create = useCallback(async (payload: LoanApplicationCreateRequest) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }))
    const result = await new CreateLoanApplicationAction().execute(payload)
    setState((prev) => ({
      ...prev,
      isSaving: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const update = useCallback(async (id: string, payload: LoanApplicationUpdateRequest) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }))
    const result = await new UpdateLoanApplicationAction().execute(id, payload)
    setState((prev) => ({
      ...prev,
      isSaving: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const setFirstDueDate = useCallback(
    async (id: string, payload: LoanApplicationFirstDueDateRequest) => {
      setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
      const result = await setLoanApplicationFirstDueDateAction(id, payload)
      setState((prev) => ({
        ...prev,
        isWorkflowRunning: false,
        error: result.success ? null : mapErrorMessage(result),
      }))
      return result
    },
    [],
  )

  const submit = useCallback(async (id: string, payload: LoanApplicationSubmitRequest) => {
    setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
    const result = await new SubmitLoanApplicationAction().execute(id, payload)
    setState((prev) => ({
      ...prev,
      isWorkflowRunning: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const approve = useCallback(async (id: string, payload: LoanApplicationApproveRequest) => {
    setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
    const result = await new ApproveLoanApplicationAction().execute(id, payload)
    setState((prev) => ({
      ...prev,
      isWorkflowRunning: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const disburse = useCallback(
    async (id: string, payload: LoanApplicationDisburseRequest) => {
      setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
      const result = await new DisburseLoanApplicationAction().execute(id, payload)
      setState((prev) => ({
        ...prev,
        isWorkflowRunning: false,
        error: result.success ? null : mapErrorMessage(result),
      }))
      return result
    },
    [],
  )

  const reject = useCallback(async (id: string, payload: LoanApplicationRejectRequest) => {
    setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
    const result = await new RejectLoanApplicationAction().execute(id, payload)
    setState((prev) => ({
      ...prev,
      isWorkflowRunning: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const cancel = useCallback(async (id: string, payload: LoanApplicationCancelRequest) => {
    setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
    const result = await new CancelLoanApplicationAction().execute(id, payload)
    setState((prev) => ({
      ...prev,
      isWorkflowRunning: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const returnToDraft = useCallback(
    async (id: string, payload: LoanApplicationReturnToDraftRequest) => {
      setState((prev) => ({ ...prev, isWorkflowRunning: true, error: null }))
      const result = await new ReturnLoanApplicationToDraftAction().execute(id, payload)
      setState((prev) => ({
        ...prev,
        isWorkflowRunning: false,
        error: result.success ? null : mapErrorMessage(result),
      }))
      return result
    },
    [],
  )

  const addCollateral = useCallback(
    async (applicationId: string, payload: LoanApplicationCollateralAddRequest) => {
      setState((prev) => ({ ...prev, isCollateralSaving: true, error: null }))
      const result = await new AddLoanApplicationCollateralAction().execute(
        applicationId,
        payload,
      )
      setState((prev) => ({
        ...prev,
        isCollateralSaving: false,
        error: result.success ? null : mapErrorMessage(result),
      }))
      return result
    },
    [],
  )

  const removeCollateral = useCallback(async (applicationId: string, linkId: string) => {
    setState((prev) => ({ ...prev, isCollateralSaving: true, error: null }))
    const result = await new RemoveLoanApplicationCollateralAction().execute(
      applicationId,
      linkId,
    )
    setState((prev) => ({
      ...prev,
      isCollateralSaving: false,
      error: result.success ? null : mapErrorMessage(result),
    }))
    return result
  }, [])

  const previewSchedule = useCallback(
    async (
      id: string,
      payload: LoanSchedulePreviewRequest,
    ): Promise<ApiResult<LoanSchedulePreviewResponse>> => {
      setState((prev) => ({ ...prev, isPreviewLoading: true, error: null }))
      const result = await new PreviewLoanApplicationScheduleAction().execute(id, payload)
      setState((prev) => ({
        ...prev,
        isPreviewLoading: false,
        error: result.success ? null : mapErrorMessage(result),
      }))
      return result
    },
    [],
  )

  const saveFeeOverrides = useCallback(
    async (
      id: string,
      payload: LoanApplicationFeeOverridesUpsertRequest,
    ): Promise<ApiResult<LoanApplicationFeeResponse[]>> => {
      setState((prev) => ({ ...prev, isFeeSaving: true, error: null }))
      const result = await new SaveLoanApplicationFeeOverridesAction().execute(id, payload)
      setState((prev) => ({
        ...prev,
        isFeeSaving: false,
        error: result.success ? null : mapErrorMessage(result),
      }))
      return result
    },
    [],
  )

  return {
    ...state,
    setError,
    create,
    update,
    setFirstDueDate,
    submit,
    approve,
    disburse,
    reject,
    cancel,
    returnToDraft,
    addCollateral,
    removeCollateral,
    previewSchedule,
    saveFeeOverrides,
  }
}
