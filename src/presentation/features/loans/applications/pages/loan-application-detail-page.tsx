import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoanApplicationReport } from '@/presentation/components/reports/loans/loan-application-report'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { LoanApplicationAddCollateralModal } from '@/presentation/features/loans/applications/components/loan-application-add-collateral-modal'
import { LoanApplicationCollateralsCard } from '@/presentation/features/loans/applications/components/loan-application-collaterals-card'
import { LoanApplicationScoringModal } from '@/presentation/features/loans/applications/components/loan-application-scoring-modal'
import { LoanApplicationFeesCard } from '@/presentation/features/loans/applications/components/loan-application-fees-card'
import { LoanApplicationHeaderCard } from '@/presentation/features/loans/applications/components/loan-application-header-card'
import { LoanApplicationPaymentPlanModal } from '@/presentation/features/loans/applications/components/loan-application-payment-plan-modal'
import { LoanApplicationRequestedDataCard } from '@/presentation/features/loans/applications/components/loan-application-requested-data-card'
import { LoanApplicationAnticipatedInstallmentSection } from '@/presentation/features/loans/applications/components/loan-application-anticipated-installment-section'
import { useGenerateLoanApplicationScoring } from '@/presentation/features/loans/applications/hooks/use-generate-loan-application-scoring'
import { useLoanApplicationFees } from '@/presentation/features/loans/applications/hooks/use-loan-application-fees'
import { DisburseLoanModal } from '@/presentation/features/loans/components/disburse-loan-modal'
import { DisbursementSummaryCard } from '@/presentation/features/loans/components/disbursement-summary-card'
import { useLoanApplication } from '@/presentation/features/loans/applications/hooks/use-loan-application'
import { useLoanApplicationApprovedLoan } from '@/presentation/features/loans/applications/hooks/use-loan-application-approved-loan'
import { useLoanApplicationReport } from '@/presentation/features/loans/applications/hooks/use-loan-application-report'
import { useLoanApplicationScoring } from '@/presentation/features/loans/applications/hooks/use-loan-application-scoring'
import { useLoanApplicationScoringHistory } from '@/presentation/features/loans/applications/hooks/use-loan-application-scoring-history'
import { useLoanApplicationMutations } from '@/presentation/features/loans/applications/hooks/use-loan-application-mutations'
import { useLoanApplicationOptions } from '@/presentation/features/loans/applications/hooks/use-loan-application-options'
import { useLoanApplicationAnticipatedInstallment } from '@/presentation/features/loans/applications/hooks/use-loan-application-anticipated-installment'
import { MessageModal } from '@/presentation/share/components/message-modal'
import type { LoanApplicationAllowedAction } from '@/infrastructure/loans/responses/loan-application-actions-response'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import type {
  LoanApplicationFeeOverrideUpsertItemRequest,
  LoanApplicationFeeOverridesUpsertRequest,
} from '@/infrastructure/loans/requests/loan-application-fee-overrides-upsert-request'
import type { LoanSchedulePreviewFormValues } from '@/infrastructure/validations/loans/loan-schedule-preview.schema'
import type { LoanApplicationFeeOverrideFormValues } from '@/infrastructure/validations/loans/loan-application-fee-override.schema'
import { mapPercentInputToRate, mapRateToPercentValue } from '@/core/helpers/rate-percent'
import {
  formatLoanApplicationScore,
  formatLoanApplicationScoringDateTime,
  resolveLoanApplicationScoringLabel,
  resolveLoanApplicationScoringVariantClasses,
} from '@/core/helpers/loan-application-scoring-ui'

type ConfirmAction =
  | 'generate_scoring'
  | 'submit'
  | 'approve'
  | 'disburse'
  | 'reject'
  | 'cancel'
  | 'return_to_draft'
  | null

type ScoringTab = 'current' | 'history'

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
    loanDetail,
    loadApprovedLoan,
  } = useLoanApplicationApprovedLoan()
  const { report, isLoading: isReportLoading, loadReport, clearReport } =
    useLoanApplicationReport()
  const {
    scoring,
    isLoading: isScoringLoading,
    error: scoringError,
    load: loadScoring,
    clear: clearScoring,
  } = useLoanApplicationScoring()
  const {
    history: scoringHistory,
    isLoading: isScoringHistoryLoading,
    error: scoringHistoryError,
    load: loadScoringHistory,
    clear: clearScoringHistory,
  } = useLoanApplicationScoringHistory()
  const { isGenerating: isScoringGenerating, generate: generateScoring } =
    useGenerateLoanApplicationScoring()
  const {
    fees,
    isLoading: isFeesLoading,
    error: feesError,
    loadByApplicationId: loadFeesByApplicationId,
    setFees,
  } = useLoanApplicationFees()
  const {
    isWorkflowRunning,
    isCollateralSaving,
    isPreviewLoading,
    isFeeSaving,
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
  } = useLoanApplicationMutations()
  const canViewAnticipatedInstallment = allowedActions.includes('view_anticipated_installment')
  const anticipatedInstallment = useLoanApplicationAnticipatedInstallment(
    id,
    canViewAnticipatedInstallment,
  )

  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [pendingCollateral, setPendingCollateral] =
    useState<LoanApplicationCollateralResponse | null>(null)
  const [addCollateralOpen, setAddCollateralOpen] = useState(false)
  const [workflowInput, setWorkflowInput] = useState('')
  const [workflowInputError, setWorkflowInputError] = useState<string | null>(null)
  const workflowInputRef = useRef<HTMLTextAreaElement | null>(null)
  const [preview, setPreview] = useState<LoanSchedulePreviewResponse | null>(null)
  const [autoPreviewRequestedForId, setAutoPreviewRequestedForId] = useState<string | null>(null)
  const [paymentPlanOpen, setPaymentPlanOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [scoringModalOpen, setScoringModalOpen] = useState(false)
  const [scoringTab, setScoringTab] = useState<ScoringTab>('current')
  const [scoringHistoryLoadedForKey, setScoringHistoryLoadedForKey] =
    useState<string | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [disburseModalOpen, setDisburseModalOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    void loadById(id)
    void loadFeesByApplicationId(id)
    setPreview(null)
    setAutoPreviewRequestedForId(null)
    setScoringTab('current')
    setScoringHistoryLoadedForKey(null)
    clearScoring()
    clearScoringHistory()
  }, [clearScoring, clearScoringHistory, id, loadById, loadFeesByApplicationId])

  useEffect(() => {
    void loadApprovedLoan(application?.approvedLoanId ?? null)
  }, [application?.approvedLoanId, loadApprovedLoan])

  const hasAction = (action: LoanApplicationAllowedAction) => allowedActions.includes(action)
  const applicationStatusCode = (application?.statusCode ?? '').trim().toUpperCase()
  const isDraftApplication = applicationStatusCode === 'DRAFT'
  const scoringRefreshKey = [
    id,
    applicationStatusCode,
    application?.submittedOperationalDate ?? '',
    application?.returnedToDraftOperationalDate ?? '',
  ].join(':')
  const canPreview = hasAction('preview_schedule')
  const canGenerateScoring = !isDraftApplication && hasAction('generate_scoring')
  const canViewScoring = !isDraftApplication && hasAction('view_scoring')
  const canViewScoringHistory = !isDraftApplication && hasAction('view_scoring_history')

  useEffect(() => {
    if (!id) return
    if (!canViewScoring) {
      clearScoring()
      return
    }
    void loadScoring(id).then((result) => {
      if (!result.success && result.status === 404) {
        clearScoringHistory()
      }
    })
  }, [canViewScoring, clearScoring, clearScoringHistory, id, loadScoring, scoringRefreshKey])

  useEffect(() => {
    if (!id) return
    if (canViewScoring) return
    if (canViewScoringHistory) {
      setScoringTab('history')
      return
    }
    setScoringTab('current')
  }, [canViewScoring, canViewScoringHistory, id])

  useEffect(() => {
    if (!id || !canViewScoringHistory) {
      clearScoringHistory()
      return
    }
    if (scoringTab !== 'history') return
    if (scoringHistoryLoadedForKey === scoringRefreshKey) return
    setScoringHistoryLoadedForKey(scoringRefreshKey)
    void loadScoringHistory(id).then((result) => {
      if (result.success && result.data.length === 0) {
        clearScoring()
      }
    })
  }, [
    canViewScoringHistory,
    clearScoring,
    clearScoringHistory,
    id,
    loadScoringHistory,
    scoringHistoryLoadedForKey,
    scoringRefreshKey,
    scoringTab,
  ])

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

  useEffect(() => {
    if (!id || !canPreview) return
    if (preview || isPreviewLoading) return
    if (autoPreviewRequestedForId === id) return

    setAutoPreviewRequestedForId(id)
    void generatePaymentPlan()
  }, [
    autoPreviewRequestedForId,
    canPreview,
    id,
    isPreviewLoading,
    preview,
  ])

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

  const canEdit = hasAction('update_draft')
  const canSubmit = hasAction('submit')
  const canApprove = hasAction('approve')
  const canDisburse = hasAction('disburse')
  const canReject = hasAction('reject')
  const canCancel = hasAction('cancel')
  const canReturnToDraft = hasAction('return_to_draft')
  const canEditFees = hasAction('edit_fees')
  const canPrint = hasAction('print')
  const canAddCollateral = hasAction('add_collateral')
  const canRemoveCollateral = hasAction('remove_collateral')
  const canManageAnticipatedInstallment = hasAction('manage_anticipated_installment')
  const canCancelAnticipatedInstallment = hasAction('cancel_anticipated_installment')
  const totalDisbursementInsurance =
    loanDetail?.totalDisbursementInsurance ?? application.totalDisbursementInsurance ?? 0
  const disbursementDetail = {
    grossDisbursementAmount:
      loanDetail?.grossDisbursementAmount ?? application.grossDisbursementAmount ?? null,
    totalDisbursementFees:
      loanDetail?.totalDisbursementFees ?? application.totalDisbursementFees ?? null,
    totalDisbursementInsurance,
    anticipatedInstallmentDeductionAmount:
      loanDetail?.anticipatedInstallmentDeductionAmount ??
      application.anticipatedInstallmentDeductionAmount ??
      null,
    totalScheduledInsurance:
      loanDetail?.totalScheduledInsurance ?? application.totalScheduledInsurance ?? null,
    netDisbursementAmount:
      loanDetail?.netDisbursementAmount ?? application.netDisbursementAmount ?? null,
    disbursementJournalEntryId:
      loanDetail?.disbursementJournalEntryId ?? application.disbursementJournalEntryId ?? null,
    disbursementJournalEntryNumber: loanDetail?.disbursementJournalEntryNumber ?? null,
  }
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
  const openScoringModal = (tab: ScoringTab) => {
    setScoringTab(tab)
    setScoringModalOpen(true)
  }

  const openPrintPreview = async () => {
    if (!canPrint) return
    const result = await loadReport(id)
    if (result.success) {
      setReportOpen(true)
      return
    }
    setFeedback({
      tone: 'error',
      title: 'No se pudo preparar la impresion',
      description: result.error,
    })
  }

  const refreshApplicationState = async () => {
    await Promise.all([loadById(id), loadFeesByApplicationId(id)])
  }

  const refreshDisbursementPreview = async () => {
    setPreview(null)
    if (canPreview) {
      await generatePaymentPlan()
    }
  }

  const buildFeeOverridePayload = (
    currentFees: LoanApplicationFeeResponse[],
    targetFee: LoanApplicationFeeResponse,
    values: LoanApplicationFeeOverrideFormValues,
  ): LoanApplicationFeeOverridesUpsertRequest => {
    const otherOverrides = currentFees.reduce<LoanApplicationFeeOverrideUpsertItemRequest[]>(
      (acc, fee) => {
        if (fee.loanProductFeeId === targetFee.loanProductFeeId) return acc
        const normalizedMode = (fee.overrideMode ?? '').trim().toUpperCase()
        if (fee.isRemoved || normalizedMode === 'REMOVED') {
          acc.push({
            loanProductFeeId: fee.loanProductFeeId,
            overrideMode: 'REMOVED',
            overrideValue: null,
            overrideReason: fee.overrideReason?.trim() || 'Sin motivo registrado',
          })
          return acc
        }
        if (normalizedMode === 'MODIFIED') {
          acc.push({
            loanProductFeeId: fee.loanProductFeeId,
            overrideMode: 'MODIFIED',
            overrideValue: fee.overrideValue ?? fee.effectiveValue,
            overrideReason: fee.overrideReason?.trim() || 'Sin motivo registrado',
          })
          return acc
        }
        return acc
      },
      [],
    )

    const normalizedReason = values.overrideReason?.trim() || ''
    const currentOverride: LoanApplicationFeeOverrideUpsertItemRequest[] =
      values.mode === 'INHERIT'
        ? []
        : [
            {
              loanProductFeeId: targetFee.loanProductFeeId,
              overrideMode: values.mode === 'REMOVED' ? 'REMOVED' : 'MODIFIED',
              overrideValue: values.mode === 'MODIFIED' ? values.overrideValue ?? null : null,
              overrideReason: normalizedReason,
            },
          ]

    return {
      items: [...otherOverrides, ...currentOverride],
    }
  }

  const openDisbursementModal = () => {
    setDisburseModalOpen(true)
    setPreview(null)
    void generatePaymentPlan()
  }

  return (
    <div className="space-y-4">
      <LoanApplicationHeaderCard
        application={application}
        canEdit={canEdit}
        canSubmit={canSubmit}
        canApprove={canApprove}
        canDisburse={canDisburse}
        canReject={canReject}
        canCancel={canCancel}
        canReturnToDraft={canReturnToDraft}
        canPreview={canPreview}
        canPrint={canPrint}
        canGenerateScoring={canGenerateScoring}
        isProcessingWorkflow={isWorkflowRunning}
        isPrinting={isReportLoading}
        onOpenFinancialProfile={() =>
          navigate(`/loans/applications/${application.id}/financial-profile`, {
            state: { returnTo: `/loans/applications/${application.id}` },
          })
        }
        onOpenPaymentPlan={() => {
          setPaymentPlanOpen(true)
          void generatePaymentPlan()
        }}
        onPrint={() => {
          void openPrintPreview()
        }}
        onGenerateScoring={() => openConfirmModal('generate_scoring')}
        onSubmit={() => openConfirmModal('submit')}
        onApprove={() => openConfirmModal('approve')}
        onDisburse={openDisbursementModal}
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

      {canViewAnticipatedInstallment ? (
        <LoanApplicationAnticipatedInstallmentSection
          data={anticipatedInstallment.data}
          history={anticipatedInstallment.history}
          isLoading={anticipatedInstallment.isLoading}
          isSaving={anticipatedInstallment.isSaving}
          error={anticipatedInstallment.error}
          canManage={canManageAnticipatedInstallment}
          canCancel={canCancelAnticipatedInstallment}
          onPreview={anticipatedInstallment.previewLimit}
          onSave={anticipatedInstallment.save}
          onCancel={anticipatedInstallment.cancel}
          onRefreshActions={async () => {
            await loadById(id)
            await refreshDisbursementPreview()
          }}
        />
      ) : null}

      {(canViewScoring || canViewScoringHistory) ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Scoring crediticio
                </h2>
                {scoring ? (
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${resolveLoanApplicationScoringVariantClasses(
                      scoring.uiVariant,
                    )}`}
                  >
                    {resolveLoanApplicationScoringLabel(
                      scoring.riskLevelDisplayName,
                      scoring.riskLevelName,
                    )}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isScoringLoading
                  ? 'Consultando scoring vigente...'
                  : scoring
                    ? `Score ${formatLoanApplicationScore(scoring.scoreValue)} · ${
                        scoring.recommendationDisplayName || scoring.recommendationName
                      } · ${formatLoanApplicationScoringDateTime(scoring.generatedAt)}`
                    : scoringError || 'Disponible para consulta en ventana modal.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canViewScoring ? (
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-sm"
                  onClick={() => openScoringModal('current')}
                >
                  Ver scoring
                </button>
              ) : null}
              {canViewScoringHistory ? (
                <button
                  type="button"
                  className="btn-secondary px-3 py-2 text-sm"
                  onClick={() => openScoringModal('history')}
                >
                  Ver historial
                </button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <LoanApplicationFeesCard
        fees={fees}
        charges={
          preview?.disbursement?.charges ??
          loanDetail?.disbursementCharges ??
          application.disbursementCharges
        }
        canEdit={canEditFees}
        isLoading={isFeesLoading}
        isSaving={isFeeSaving}
        error={feesError}
        onRefresh={() => {
          void loadFeesByApplicationId(id)
        }}
        onSaveOverride={async (fee, values) => {
          const payload = buildFeeOverridePayload(fees, fee, values)
          const result = await saveFeeOverrides(id, payload)
          if (result.success) {
            setFees(result.data)
            setPreview(null)
            await refreshApplicationState()
            if (canPreview) {
              await generatePaymentPlan()
            }
            setFeedback({
              tone: 'success',
              title: 'Comisiones actualizadas',
              description: 'Los cambios de comisiones se guardaron correctamente.',
            })
            return true
          }

          setFeedback({
            tone: 'error',
            title: 'No se pudieron guardar las comisiones',
            description: result.error,
          })
          return false
        }}
      />

      {(canDisburse || application.disbursedOperationalDate) && (
        <DisbursementSummaryCard
          title="Resumen de desembolso"
          emptyMessage="Aún no hay datos detallados del desembolso para esta solicitud."
          data={preview?.disbursement ?? disbursementDetail}
        />
      )}

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
        termUnitName={application.requestedTermUnitName}
        applicationLabel={application.applicationNo || application.id.slice(0, 8)}
        onClose={() => setPaymentPlanOpen(false)}
      />

      <LoanApplicationScoringModal
        open={scoringModalOpen}
        tab={scoringTab}
        canViewScoring={canViewScoring}
        canViewScoringHistory={canViewScoringHistory}
        scoring={scoring}
        scoringHistory={scoringHistory}
        isScoringLoading={isScoringLoading}
        isScoringHistoryLoading={isScoringHistoryLoading}
        scoringError={scoringError}
        scoringHistoryError={scoringHistoryError}
        onTabChange={setScoringTab}
        onClose={() => setScoringModalOpen(false)}
      />

      <ConfirmModal
        open={Boolean(confirmAction) && confirmAction !== 'disburse'}
        title={
          confirmAction === 'generate_scoring'
            ? 'Generar scoring crediticio'
            : confirmAction === 'submit'
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
          confirmAction === 'generate_scoring'
            ? 'Se generará una nueva evaluación crediticia y quedará registrada en el historial de la solicitud'
            : confirmAction === 'return_to_draft'
            ? 'Esta acción regresará la solicitud a borrador y requiere motivo.'
            : confirmAction === 'reject' || confirmAction === 'cancel'
              ? 'Esta acción cambiará el estado de la solicitud y requiere motivo.'
              : 'Esta acción cambiará el estado de la solicitud. Puedes registrar una nota.'
        }
        confirmLabel={confirmAction === 'generate_scoring' ? 'Generar' : 'Confirmar'}
        isProcessing={confirmAction === 'generate_scoring' ? isScoringGenerating : isWorkflowRunning}
        onCancel={closeConfirmModal}
        onConfirm={async () => {
          if (!confirmAction) return
          if (confirmAction === 'generate_scoring') {
            const result = await generateScoring(id)
            if (result.success) {
              setConfirmAction(null)
              await Promise.all([
                loadById(id),
                canViewScoring ? loadScoring(id) : Promise.resolve(),
                canViewScoringHistory ? loadScoringHistory(id) : Promise.resolve(),
              ])
              setScoringHistoryLoadedForKey(null)
              setScoringTab(canViewScoring ? 'current' : 'history')
              setFeedback({
                tone: 'success',
                title: 'Scoring generado',
                description: 'La evaluación crediticia se generó correctamente.',
              })
              return
            }

            setFeedback({
              tone: 'error',
              title: 'No se pudo generar el scoring crediticio',
              description: result.error,
            })
            return
          }
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
            await refreshApplicationState()
            if (
              appliedAction === 'submit' ||
              appliedAction === 'approve' ||
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
        {confirmAction && confirmAction !== 'generate_scoring' ? (
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

      <DisburseLoanModal
        open={disburseModalOpen}
        application={application}
        previewDisbursement={preview?.disbursement ?? null}
        isPreviewLoading={isPreviewLoading}
        isProcessing={isWorkflowRunning}
        onCancel={() => setDisburseModalOpen(false)}
        onConfirm={async (notes) => {
          const result = await disburse(id, { notes })
          if (result.success) {
            setApplication(result.data)
            setDisburseModalOpen(false)
            setPreview(null)
            await Promise.all([refreshApplicationState(), anticipatedInstallment.refresh()])
            setFeedback({
              tone: 'success',
              title: 'Solicitud desembolsada',
              description: 'La operación se ejecutó correctamente.',
            })
            return
          }

          if (result.status === 409) {
            setPreview(null)
            await Promise.all([refreshApplicationState(), anticipatedInstallment.refresh()])
            if (canPreview) {
              await generatePaymentPlan()
            }
          }

          setFeedback({
            tone: 'error',
            title:
              result.status === 409
                ? 'El resumen del desembolso debe actualizarse'
                : 'No se pudo desembolsar la solicitud',
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
        onAcknowledge={() => {
          const callback = feedback?.onAcknowledge
          setFeedback(null)
          callback?.()
        }}
      />

      {report ? (
        <PdfViewerDialog
          isOpen={reportOpen}
          onClose={() => {
            setReportOpen(false)
            clearReport()
          }}
          title={`Solicitud ${application.applicationNo || application.id.slice(0, 8)}`}
          document={<LoanApplicationReport data={report} organizationName="PrestaNet" />}
        />
      ) : null}
    </div>
  )
}
