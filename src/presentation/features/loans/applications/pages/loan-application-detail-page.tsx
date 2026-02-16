import { useEffect, useState } from 'react'
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
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import type { LoanSchedulePreviewFormValues } from '@/infrastructure/validations/loans/loan-schedule-preview.schema'
import { mapPercentInputToRate, mapRateToPercentValue } from '@/core/helpers/rate-percent'

type ConfirmAction = 'submit' | 'approve' | 'reject' | 'cancel' | null

interface FeedbackState {
  tone: 'success' | 'error' | 'info' | 'warning'
  title: string
  description: string
}

export const LoanApplicationDetailPage = () => {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const options = useLoanApplicationOptions()
  const { application, collaterals, isLoading, error, loadById, setApplication, setCollaterals } =
    useLoanApplication()
  const {
    isWorkflowRunning,
    isCollateralSaving,
    isPreviewLoading,
    submit,
    approve,
    reject,
    cancel,
    addCollateral,
    removeCollateral,
    previewSchedule,
  } = useLoanApplicationMutations()

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [pendingCollateral, setPendingCollateral] =
    useState<LoanApplicationCollateralResponse | null>(null)
  const [addCollateralOpen, setAddCollateralOpen] = useState(false)
  const [workflowNotes, setWorkflowNotes] = useState('')
  const [workflowReason, setWorkflowReason] = useState('')
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

  const status = application.statusCode
  const canEdit = status === 'DRAFT'
  const canSubmit = status === 'DRAFT'
  const canApprove = status === 'SUBMITTED'
  const canReject = status === 'SUBMITTED'
  const canCancel = status === 'DRAFT' || status === 'SUBMITTED'
  const canPreview = status === 'DRAFT' || status === 'SUBMITTED'

  const generatePaymentPlan = async (values?: LoanSchedulePreviewFormValues) => {
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
        canPreview={canPreview}
        isProcessingWorkflow={isWorkflowRunning}
        onOpenPaymentPlan={() => {
          setPaymentPlanOpen(true)
          void generatePaymentPlan()
        }}
        onSubmit={() => setConfirmAction('submit')}
        onApprove={() => setConfirmAction('approve')}
        onReject={() => setConfirmAction('reject')}
        onCancel={() => setConfirmAction('cancel')}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Notas del flujo
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Notas (enviar / aprobar)
            </label>
            <textarea
              rows={3}
              value={workflowNotes}
              onChange={(event) => setWorkflowNotes(event.target.value)}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Motivo (rechazar / cancelar)
            </label>
            <textarea
              rows={3}
              value={workflowReason}
              onChange={(event) => setWorkflowReason(event.target.value)}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>
      </div>

      <LoanApplicationRequestedDataCard application={application} />

      <LoanApplicationCollateralsCard
        collaterals={collaterals}
        canEdit={canEdit}
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
        searchCollaterals={(input) => options.searchCollaterals(input, application.clientId)}
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
                : 'Cancelar solicitud'
        }
        description="Esta acción cambiará el estado de la solicitud."
        confirmLabel="Confirmar"
        isProcessing={isWorkflowRunning}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!confirmAction) return

          const result =
            confirmAction === 'submit'
              ? await submit(id, { notes: workflowNotes || null })
              : confirmAction === 'approve'
                ? await approve(id, { notes: workflowNotes || null })
                : confirmAction === 'reject'
                  ? await reject(id, { reason: workflowReason || null })
                  : await cancel(id, { reason: workflowReason || null })

          if (result.success) {
            setApplication(result.data)
            setConfirmAction(null)
            setFeedback({
              tone: 'success',
              title: 'Acción aplicada',
              description: 'La operación se ejecutó correctamente.',
            })
            return
          }
          setFeedback({
            tone: 'error',
            title: 'No se pudo aplicar la acción',
            description: result.error,
          })
        }}
      />

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
        onAcknowledge={() => setFeedback(null)}
      />
    </div>
  )
}
