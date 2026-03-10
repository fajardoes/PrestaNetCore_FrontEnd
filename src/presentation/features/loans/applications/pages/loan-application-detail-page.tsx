import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { LoanApplicationAddCollateralModal } from '@/presentation/features/loans/applications/components/loan-application-add-collateral-modal'
import { LoanApplicationCollateralsCard } from '@/presentation/features/loans/applications/components/loan-application-collaterals-card'
import { LoanApplicationHeaderCard } from '@/presentation/features/loans/applications/components/loan-application-header-card'
import { LoanApplicationPaymentPlanModal } from '@/presentation/features/loans/applications/components/loan-application-payment-plan-modal'
import { LoanApplicationRequestedDataCard } from '@/presentation/features/loans/applications/components/loan-application-requested-data-card'
import { useLoanApplication } from '@/presentation/features/loans/applications/hooks/use-loan-application'
import { useLoanApplicationMutations } from '@/presentation/features/loans/applications/hooks/use-loan-application-mutations'
import { useLoanApplicationOptions } from '@/presentation/features/loans/applications/hooks/use-loan-application-options'
import { MessageModal } from '@/presentation/share/components/message-modal'
import type { LoanApplicationAllowedAction } from '@/infrastructure/loans/responses/loan-application-actions-response'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import type { LoanSchedulePreviewFormValues } from '@/infrastructure/validations/loans/loan-schedule-preview.schema'
import { mapPercentInputToRate, mapRateToPercentValue } from '@/core/helpers/rate-percent'

type ConfirmAction =
  | 'submit'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'return_to_draft'
  | null

interface FeedbackState {
  tone: 'success' | 'error' | 'info' | 'warning'
  title: string
  description: string
  onAcknowledge?: () => void
}

export const LoanApplicationDetailPage = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const options = useLoanApplicationOptions()
  const {
    application,
    collaterals,
    allowedActions,
    isLoading,
    error,
    actionsError,
    loadById,
    setApplication,
    setCollaterals,
  } = useLoanApplication()
  const {
    isWorkflowRunning,
    isCollateralSaving,
    isPreviewLoading,
    submit,
    approve,
    reject,
    cancel,
    returnToDraft,
    addCollateral,
    removeCollateral,
    previewSchedule,
  } = useLoanApplicationMutations()

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [pendingCollateral, setPendingCollateral] =
    useState<LoanApplicationCollateralResponse | null>(null)
  const [addCollateralOpen, setAddCollateralOpen] = useState(false)
  const [workflowInput, setWorkflowInput] = useState('')
  const [workflowInputError, setWorkflowInputError] = useState<string | null>(null)
  const workflowInputRef = useRef<HTMLTextAreaElement | null>(null)
  const [preview, setPreview] = useState<LoanSchedulePreviewResponse | null>(null)
  const [paymentPlanOpen, setPaymentPlanOpen] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  useEffect(() => {
    if (!id) return
    void loadById(id)
  }, [id, loadById])

  if (isLoading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando solicitud...</p>
  }

  if (error || !application) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {error ?? 'No se encontró la solicitud.'}
      </div>
    )
  }

  const hasAction = (action: LoanApplicationAllowedAction) => allowedActions.includes(action)
  const canEdit = hasAction('update_draft')
  const canSubmit = hasAction('submit')
  const canApprove = hasAction('approve')
  const canReject = hasAction('reject')
  const canCancel = hasAction('cancel')
  const canReturnToDraft = hasAction('return_to_draft')
  const canPreview = hasAction('preview_schedule')
  const canAddCollateral = hasAction('add_collateral')
  const canRemoveCollateral = hasAction('remove_collateral')
  const reasonRequiredActions: ConfirmAction[] = ['reject', 'cancel', 'return_to_draft']
  const openConfirmModal = (action: Exclude<ConfirmAction, null>) => {
    setConfirmAction(action)
    setWorkflowInput('')
    setWorkflowInputError(null)
  }
  const closeConfirmModal = () => {
    setConfirmAction(null)
    setWorkflowInputError(null)
  }

  const generatePaymentPlan = async (values?: LoanSchedulePreviewFormValues) => {
    if (!canPreview) return
    const result = await previewSchedule(id, {
      paymentFrequencyIdOverride: values?.paymentFrequencyIdOverride || null,
      firstDueDateOverride: values?.firstDueDateOverride || null,
      principalOverride: values?.principalOverride ?? null,
      termOverride: values?.termOverride ?? null,
      nominalRateOverride:
        values?.nominalRateOverride == null
          ? null
          : mapPercentInputToRate(values.nominalRateOverride),
    })
    if (result.success) {
      setPreview(result.data)
      return
    }
    setFeedback({
      tone: 'error',
      title: 'No se pudo generar el plan de pagos',
      description: result.error,
    })
  }

  return (
    <div className="space-y-4">
      <LoanApplicationHeaderCard
        application={application}
        canEdit={canEdit}
        canSubmit={canSubmit}
        canApprove={canApprove}
        canReject={canReject}
        canCancel={canCancel}
        canReturnToDraft={canReturnToDraft}
        canPreview={canPreview}
        isProcessingWorkflow={isWorkflowRunning}
        onOpenFinancialProfile={() =>
          navigate(`/loans/applications/${application.id}/financial-profile`, {
            state: { returnTo: `/loans/applications/${application.id}` },
          })
        }
        onOpenPaymentPlan={() => {
          setPaymentPlanOpen(true)
          void generatePaymentPlan()
        }}
        onSubmit={() => openConfirmModal('submit')}
        onApprove={() => openConfirmModal('approve')}
        onReject={() => openConfirmModal('reject')}
        onCancel={() => openConfirmModal('cancel')}
        onReturnToDraft={() => openConfirmModal('return_to_draft')}
      />

      {actionsError ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          No fue posible resolver acciones habilitadas: {actionsError}
        </div>
      ) : null}

      <LoanApplicationRequestedDataCard application={application} />

      <LoanApplicationCollateralsCard
        collaterals={collaterals}
        canAddCollateral={canAddCollateral}
        canRemoveCollateral={canRemoveCollateral}
        isProcessing={isCollateralSaving}
        onAdd={() => setAddCollateralOpen(true)}
        onRemove={(item) => setPendingCollateral(item)}
      />

      <div className="flex justify-end">
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={() => navigate('/loans/applications')}
        >
          Volver al listado
        </button>
      </div>

      <LoanApplicationAddCollateralModal
        open={addCollateralOpen}
        isSubmitting={isCollateralSaving}
        onClose={() => setAddCollateralOpen(false)}
        onSubmit={async (values) => {
          const result = await addCollateral(id, {
            ...values,
            coverageValue: values.coverageValue ?? null,
            notes: values.notes || null,
          })
          if (result.success) {
            setCollaterals([...collaterals, result.data])
            setAddCollateralOpen(false)
            void loadById(id)
            setFeedback({
              tone: 'success',
              title: 'Garantía agregada',
              description: 'La garantía se agregó correctamente.',
            })
            return
          }
          setFeedback({
            tone: 'error',
            title: 'No se pudo agregar la garantía',
            description: result.error,
          })
        }}
        listCollaterals={({ search, pageNumber, pageSize }) =>
          options.listClientCollaterals({
            ownerClientId: application.clientId,
            search,
            pageNumber,
            pageSize,
          })
        }
      />

      <LoanApplicationPaymentPlanModal
        open={paymentPlanOpen}
        isLoading={isPreviewLoading}
        preview={preview}
        onGenerate={(values) => {
          void generatePaymentPlan(values)
        }}
        listPaymentFrequencies={() => options.listPaymentFrequencies()}
        initialValues={{
          principalOverride: application.requestedPrincipal,
          termOverride: application.requestedTerm,
          paymentFrequencyIdOverride: application.requestedPaymentFrequencyId,
          nominalRateOverride:
            application.requestedRateOverride == null
              ? null
              : mapRateToPercentValue(application.requestedRateOverride),
          firstDueDateOverride: null,
        }}
        applicationLabel={application.applicationNo || application.id.slice(0, 8)}
        onClose={() => setPaymentPlanOpen(false)}
      />

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={
          confirmAction === 'submit'
            ? 'Enviar solicitud'
            : confirmAction === 'approve'
              ? 'Aprobar solicitud'
              : confirmAction === 'reject'
                ? 'Rechazar solicitud'
                : confirmAction === 'return_to_draft'
                  ? 'Devolver a borrador'
                : 'Cancelar solicitud'
        }
        description={
          confirmAction === 'return_to_draft'
            ? 'Esta acción regresará la solicitud a borrador y requiere motivo.'
            : confirmAction === 'reject' || confirmAction === 'cancel'
              ? 'Esta acción cambiará el estado de la solicitud y requiere motivo.'
              : 'Esta acción cambiará el estado de la solicitud. Puedes registrar una nota.'
        }
        confirmLabel="Confirmar"
        isProcessing={isWorkflowRunning}
        onCancel={closeConfirmModal}
        onConfirm={async () => {
          if (!confirmAction) return
          const note = workflowInput.trim()
          const requiresReason = reasonRequiredActions.includes(confirmAction)
          if (requiresReason && !note) {
            setWorkflowInputError('Debes ingresar un motivo.')
            workflowInputRef.current?.focus()
            return
          }

          const result =
            confirmAction === 'submit'
              ? await submit(id, { notes: note || null })
              : confirmAction === 'approve'
                ? await approve(id, { notes: note || null })
                : confirmAction === 'reject'
                  ? await reject(id, { reason: note })
                  : confirmAction === 'return_to_draft'
                    ? await returnToDraft(id, { reason: note })
                  : await cancel(id, { reason: note })

          if (result.success) {
            const appliedAction = confirmAction
            setApplication(result.data)
            setConfirmAction(null)
            setWorkflowInput('')
            setWorkflowInputError(null)
            const successTitle =
              appliedAction === 'reject'
                ? 'Solicitud rechazada'
                : appliedAction === 'approve'
                  ? 'Solicitud aprobada'
                  : appliedAction === 'submit'
                    ? 'Solicitud enviada'
                    : appliedAction === 'cancel'
                      ? 'Solicitud cancelada'
                      : 'Acción aplicada'
            if (
              appliedAction === 'submit' ||
              appliedAction === 'return_to_draft' ||
              appliedAction === 'cancel' ||
              appliedAction === 'reject'
            ) {
              navigate('/loans/applications', {
                state: {
                  workflowFeedback: {
                    tone: 'success',
                    title: successTitle,
                    description: 'La operación se ejecutó correctamente.',
                  },
                },
              })
              return
            }
            setFeedback({
              tone: 'success',
              title: successTitle,
              description: 'La operación se ejecutó correctamente.',
              onAcknowledge: () => {
                void loadById(id)
              },
            })
            return
          }
          setFeedback({
            tone: 'error',
            title: 'No se pudo aplicar la acción',
            description: result.error,
          })
        }}
      >
        {confirmAction ? (
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {reasonRequiredActions.includes(confirmAction)
                ? 'Motivo *'
                : 'Nota de flujo (opcional)'}
            </label>
            <textarea
              ref={workflowInputRef}
              rows={3}
              value={workflowInput}
              onChange={(event) => {
                setWorkflowInput(event.target.value)
                if (workflowInputError) {
                  setWorkflowInputError(null)
                }
              }}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Máximo 500 caracteres.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {workflowInput.length}/500
              </p>
            </div>
            {workflowInputError ? (
              <p className="text-xs text-red-600 dark:text-red-300">{workflowInputError}</p>
            ) : null}
          </div>
        ) : null}
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(pendingCollateral)}
        title="Eliminar garantía"
        description="La garantía se desvinculará de la solicitud de crédito."
        confirmLabel="Eliminar"
        isProcessing={isCollateralSaving}
        onCancel={() => setPendingCollateral(null)}
        onConfirm={async () => {
          if (!pendingCollateral) return
          const result = await removeCollateral(id, pendingCollateral.linkId)
          if (result.success) {
            setCollaterals(
              collaterals.filter((item) => item.linkId !== pendingCollateral.linkId),
            )
            setPendingCollateral(null)
            void loadById(id)
            setFeedback({
              tone: 'success',
              title: 'Garantía eliminada',
              description: 'La garantía fue eliminada correctamente.',
            })
            return
          }
          setFeedback({
            tone: 'error',
            title: 'No se pudo eliminar la garantía',
            description: result.error,
          })
        }}
      />

      <MessageModal
        open={Boolean(feedback)}
        tone={feedback?.tone}
        title={feedback?.title || ''}
        description={feedback?.description || ''}
        onAcknowledge={() => {
          const callback = feedback?.onAcknowledge
          setFeedback(null)
          callback?.()
        }}
      />
    </div>
  )
}
