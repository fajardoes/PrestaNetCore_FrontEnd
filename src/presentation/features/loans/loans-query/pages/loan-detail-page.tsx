import { CalendarRange, CheckCircle2, ClipboardList, History, ReceiptText } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'
import { DisbursementChargesTable } from '@/presentation/features/loans/components/disbursement-charges-table'
import { LoanInsuranceSummaryContent } from '@/presentation/features/loans/components/loan-insurance-summary-content'
import { DisbursementSummaryCard } from '@/presentation/features/loans/components/disbursement-summary-card'
import { RecognitionPolicyBadges } from '@/presentation/features/loans/components/recognition-policy-badges'
import { LoanDisbursementReversalEligibilityCard } from '@/presentation/features/loans/loans-query/components/loan-disbursement-reversal-eligibility-card'
import { LoanDisbursementReversalModal } from '@/presentation/features/loans/loans-query/components/loan-disbursement-reversal-modal'
import { LoanAnticipatedInstallmentSection } from '@/presentation/features/loans/loans-query/components/loan-anticipated-installment-section'
import { InstallmentDetailModal } from '@/presentation/features/loans/loans-query/components/installment-detail-modal'
import { LoanPaymentsModal } from '@/presentation/features/loans/loans-query/components/loan-payments-modal'
import { GeneratedDocumentsPanel } from '@/presentation/features/documents/generated-documents/components/generated-documents-panel'
import { useGeneratedDocuments } from '@/presentation/features/documents/generated-documents/hooks/use-generated-documents'
import {
  QueryDetailField,
  QueryHeroCard,
  QueryMetricCard,
  QuerySectionCard,
} from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { useLoanInstallments } from '@/presentation/features/loans/loans-query/hooks/use-loan-installments'
import { useLoanInstallment } from '@/presentation/features/loans/loans-query/hooks/use-loan-installment'
import { useLoanPayments } from '@/presentation/features/loans/loans-query/hooks/use-loan-payments'
import { useLoan } from '@/presentation/features/loans/loans-query/hooks/use-loan'
import { useLoanAnticipatedInstallment } from '@/presentation/features/loans/loans-query/hooks/use-loan-anticipated-installment'
import { usePaymentReceiptReport } from '@/presentation/features/payments/hooks/use-payment-receipt-report'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMoney,
  getInstallmentComponentAmount,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { CollapsibleSection } from '@/presentation/share/components/collapsible-section'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { TableActionButton } from '@/presentation/share/components/table-action-button'
import { TableContainer } from '@/presentation/share/components/table-container'
import { useNotifications } from '@/providers/NotificationProvider'

export const LoanDetailPage = () => {
  const location = useLocation()
  const { id = '' } = useParams()
  const [reversalModalOpen, setReversalModalOpen] = useState(false)
  const [paymentsModalOpen, setPaymentsModalOpen] = useState(false)
  const [selectedInstallmentNo, setSelectedInstallmentNo] = useState<number | null>(null)
  const closeInstallmentModal = useCallback(() => setSelectedInstallmentNo(null), [])
  const {
    loan,
    allowedActions,
    actionsError,
    eligibility,
    eligibilityError,
    isLoading: isLoadingLoan,
    isLoadingEligibility,
    isReversing,
    error: loanError,
    mutationError,
    setMutationError,
    loadLoan,
    loadEligibility,
    clearEligibility,
    reverseDisbursement,
  } = useLoan()
  const {
    installments,
    isLoading: isLoadingInstallments,
    error: installmentsError,
    loadInstallments,
  } = useLoanInstallments()
  const {
    installment: selectedInstallment,
    isLoading: isLoadingInstallmentDetail,
    error: installmentDetailError,
    loadInstallment: loadInstallmentDetail,
  } = useLoanInstallment()
  const { hasPermission } = useUserPermissions()
  const { notify } = useNotifications()
  const receiptReport = usePaymentReceiptReport()

  const canReadEligibility = hasPermission('loans.disbursement_reversal.read_eligibility')
  const canReadGeneratedDocuments = hasPermission('documents.generated.read')
  const canDownloadGeneratedDocuments = hasPermission('documents.generated.download')
  const canRetryGeneratedDocuments = hasPermission('documents.generated.retry')
  const canReadPayments = hasPermission('payments.read')
  const canPrintReceipts = hasPermission('reports.payment_receipt.read')
  const canExecuteReversal = hasPermission('loans.disbursement_reversal.execute')
  const canViewAnticipatedInstallment = allowedActions.includes('view_anticipated_installment')
  const canApplyAnticipatedInstallment = allowedActions.includes('apply_anticipated_installment')
  const canReverseAnticipatedInstallment = allowedActions.includes('reverse_anticipated_installment_application')
  const anticipatedInstallment = useLoanAnticipatedInstallment(id, canViewAnticipatedInstallment)
  const generatedDocuments = useGeneratedDocuments({
    enabled: Boolean(id) && canReadGeneratedDocuments,
    loanId: id,
  })
  const loanPayments = useLoanPayments(id, paymentsModalOpen && canReadPayments)
  const isDisbursementAlreadyReversed =
    Boolean(loan?.isDisbursementReversed) ||
    (loan?.statusCode ?? '').trim().toUpperCase() === 'DISBURSEMENT_REVERSED'

  useEffect(() => {
    if (!id) return
    void Promise.all([
      loadLoan(id),
      loadInstallments(id),
    ])
  }, [id, loadInstallments, loadLoan])

  useEffect(() => {
    if (!id || !canReadEligibility) {
      clearEligibility()
      return
    }

    void loadEligibility(id)
  }, [id, canReadEligibility, clearEligibility, loadEligibility])

  useEffect(() => {
    if (!id || selectedInstallmentNo === null) return
    void loadInstallmentDetail(id, selectedInstallmentNo)
  }, [id, loadInstallmentDetail, selectedInstallmentNo])

  const installmentSummary = useMemo(() => {
    const totalProjected = installments.reduce((sum, item) => sum + item.totalProjected, 0)
    const totalPaid = installments.reduce((sum, item) => sum + item.totalPaid, 0)
    const pendingCount = installments.filter((item) => item.totalPaid < item.totalProjected).length
    const settledCount = installments.length - pendingCount
    const nextDue = installments
      .filter((item) => item.totalPaid < item.totalProjected)
      .sort((left, right) => left.dueDateAdjusted.localeCompare(right.dueDateAdjusted))[0]

    return {
      totalProjected,
      totalPaid,
      pendingCount,
      settledCount,
      nextDueDate: nextDue?.dueDateAdjusted ?? null,
    }
  }, [installments])

  if (isLoadingLoan) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando préstamo...</p>
  }

  if (loanError || !loan) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {loanError ?? 'No se encontró el préstamo.'}
      </div>
    )
  }

  const loanLabel = loan.loanNo?.trim() || loan.id
  const navigationState = location.state as { returnTo?: string; loansQueryState?: unknown } | null
  const returnTo = navigationState?.returnTo ?? '/loans'
  const paidRatio =
    installmentSummary.totalProjected > 0
      ? (installmentSummary.totalPaid / installmentSummary.totalProjected) * 100
      : 0

  return (
    <div className="space-y-3">
      <QueryHeroCard
        eyebrow="Expediente financiero"
        title={loanLabel}
        description="Vista consolidada del préstamo con indicadores de cartera, cronograma, desembolso y señales operativas para seguimiento corporativo."
        badge={
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(loan.statusCode)}`}
          >
            {translateLoanApplicationStatus(loan.statusCode, loan.statusName)}
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {canReadPayments ? (
              <button
                type="button"
                className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                onClick={() => setPaymentsModalOpen(true)}
              >
                <History className="h-4 w-4" aria-hidden="true" />
                Ver pagos recibidos
              </button>
            ) : null}
            <Link
              className="btn-secondary px-4 py-2 text-sm"
              to={returnTo}
              state={navigationState?.loansQueryState ? { loansQueryState: navigationState.loansQueryState } : null}
            >
              Volver a consulta
            </Link>
          </div>
        }
      >
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          <QueryMetricCard
            label="Capital"
            value={formatCurrency(loan.principal)}
            hint={loan.loanProductName?.trim() || 'Producto no disponible'}
            accent="blue"
            compact
          />
          <QueryMetricCard
            label="Saldo cronograma"
            value={formatCurrency(installmentSummary.totalProjected - installmentSummary.totalPaid)}
            hint={`${formatMoney(paidRatio)}% del cronograma ya cubierto`}
            accent="sky"
            compact
          />
          <QueryMetricCard
            label="Próximo vencimiento"
            value={formatDate(installmentSummary.nextDueDate)}
            hint={`${installmentSummary.pendingCount} cuota(s) pendientes`}
            accent={installmentSummary.pendingCount > 0 ? 'amber' : 'slate'}
            compact
          />
          <QueryMetricCard
            label="Tasa nominal"
            value={formatRateAsPercent(loan.nominalRate)}
            hint={`Plazo contractual: ${loan.term} ${loan.termUnitName}`}
            accent="slate"
            compact
          />
        </div>
      </QueryHeroCard>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)]">
        <QuerySectionCard
          title="Resumen ejecutivo"
          description="Datos principales del préstamo y su cronograma."
          collapsible
          defaultExpanded
        >
          <div className="grid gap-x-4 gap-y-2 md:grid-cols-2 xl:grid-cols-12">
            <QueryDetailField
              label="No. de préstamo"
              value={loan.loanNo?.trim() || '—'}
              variant="compact"
              className="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-2 dark:border-sky-500/30 dark:bg-sky-500/10 md:col-span-1 xl:col-span-4"
            />
            <QueryDetailField
              label="Cliente"
              value={
                <div className="space-y-1">
                  <div>{loan.clientFullName?.trim() || '—'}</div>
                  <div className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    DNI: <HnIdentityText value={loan.clientIdentityNo} />
                  </div>
                </div>
              }
              variant="compact"
              className="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-2 dark:border-sky-500/30 dark:bg-sky-500/10 md:col-span-1 xl:col-span-5"
            />
            <QueryDetailField
              label="Producto"
              value={loan.loanProductName?.trim() || '—'}
              variant="compact"
              className="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-2 dark:border-sky-500/30 dark:bg-sky-500/10 md:col-span-1 xl:col-span-3"
            />
            <QueryDetailField
              label="Fecha operativa creación"
              value={formatDate(loan.createdOperationalDate)}
              variant="compact"
              className="xl:col-span-3"
            />
            <QueryDetailField
              label="Fecha compromiso cronograma"
              value={formatDate(loan.scheduleCommittedOperationalDate)}
              variant="compact"
              className="xl:col-span-3"
            />
            <QueryDetailField
              label="Versión de cronograma"
              value={String(loan.scheduleVersion)}
              variant="compact"
              className="xl:col-span-3"
            />
            <QueryDetailField
              label="Primera cuota"
              value={formatDate(loan.firstDueDate)}
              variant="compact"
              className="xl:col-span-3"
            />
            <QueryDetailField
              label="Plazo contractual"
              value={`${loan.term} ${loan.termUnitName}`}
              variant="compact"
              className="xl:col-span-3"
            />
            <QueryDetailField
              label="Frecuencia pactada"
              value={loan.paymentFrequencyName}
              variant="compact"
              className="xl:col-span-3"
            />
            <QueryDetailField
              label="Vencimiento contractual"
              value={formatDate(loan.maturityDate)}
              variant="compact"
              className="xl:col-span-3"
            />
          </div>
        </QuerySectionCard>

        <QuerySectionCard
          title="Indicadores de cartera"
          description="Lectura rápida del comportamiento del cronograma."
          collapsible
          defaultExpanded
        >
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <QueryMetricCard
                label="Número de cuotas"
                value={String(loan.installmentsCount ?? installments.length)}
                hint={`${installmentSummary.settledCount} liquidada(s)`}
                accent="slate"
              />
              <QueryMetricCard
                label="Total proyectado"
                value={formatCurrency(installmentSummary.totalProjected)}
                hint={`Pagado: ${formatCurrency(installmentSummary.totalPaid)}`}
                accent="blue"
              />
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Avance de cobro del cronograma
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatMoney(paidRatio)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-sky-500 to-sky-400 transition-all"
                  style={{ width: `${Math.max(0, Math.min(paidRatio, 100))}%` }}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <SignalRow
                icon={<ClipboardList className="h-4 w-4" />}
                label="Frecuencia pactada"
                value={loan.paymentFrequencyName}
              />
              <SignalRow
                icon={<CalendarRange className="h-4 w-4" />}
                label="Próximo vencimiento pendiente"
                value={formatDate(installmentSummary.nextDueDate)}
              />
              <SignalRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Acciones habilitadas"
                value={
                  allowedActions.length
                    ? allowedActions.map(formatAllowedAction).join(', ')
                    : 'Sin acciones operativas'
                }
              />
            </div>
          </div>
        </QuerySectionCard>
      </div>

      {(loan.isDisbursementReversed ||
        loan.disbursementReversedAt ||
        loan.disbursementReversalReason ||
        loan.disbursementReversalJournalEntryNumber ||
        loan.disbursementReversalJournalEntryId) && (
        <CollapsibleSection
          title="Desembolso revertido"
          description="Expediente cerrado por reversión del desembolso."
          defaultExpanded={false}
          className="border-amber-200 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
          contentClassName="mt-3"
          compact
        >
          <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
            <QueryDetailField
              label="Fecha y hora de reversión"
              value={formatDateTime(loan.disbursementReversedAt)}
            />
            <QueryDetailField
              label="Motivo"
              value={loan.disbursementReversalReason?.trim() || '—'}
            />
            <QueryDetailField
              label="Asiento original"
              value={
                loan.disbursementJournalEntryNumber?.trim() ||
                loan.disbursementJournalEntryId?.trim() ||
                '—'
              }
            />
            <QueryDetailField
              label="Asiento de reversa"
              value={
                loan.disbursementReversalJournalEntryNumber?.trim() ||
                loan.disbursementReversalJournalEntryId?.trim() ||
                '—'
              }
            />
          </div>
        </CollapsibleSection>
      )}

      <DisbursementSummaryCard data={loan} collapsible defaultExpanded={false} compact />

      {canReadGeneratedDocuments ? (
        <GeneratedDocumentsPanel
          state={generatedDocuments}
          canDownload={canDownloadGeneratedDocuments}
          canRetry={canRetryGeneratedDocuments}
        />
      ) : null}

      {canViewAnticipatedInstallment ? (
        <LoanAnticipatedInstallmentSection
          detail={anticipatedInstallment.detail}
          isLoading={anticipatedInstallment.isLoading}
          isSaving={anticipatedInstallment.isSaving}
          error={anticipatedInstallment.error}
          canApply={canApplyAnticipatedInstallment}
          canReverse={canReverseAnticipatedInstallment}
          onApply={anticipatedInstallment.apply}
          onReverse={anticipatedInstallment.reverse}
          collapsible
          defaultExpanded={false}
          onRefreshActions={async () => {
            await Promise.all([
              loadLoan(id),
              loadInstallments(id),
              canReadEligibility ? loadEligibility(id) : Promise.resolve(),
            ])
          }}
        />
      ) : null}

      {!isDisbursementAlreadyReversed ? (
        <LoanDisbursementReversalEligibilityCard
          eligibility={eligibility}
          eligibilityError={eligibilityError}
          isLoading={isLoadingEligibility}
          allowedActions={allowedActions}
          canExecute={canExecuteReversal}
          canReadEligibility={canReadEligibility}
          isProcessing={isReversing}
          onOpenModal={() => {
            setMutationError(null)
            setReversalModalOpen(true)
          }}
          collapsible
          defaultExpanded={false}
          compact
        />
      ) : null}

      {actionsError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          No fue posible resolver acciones habilitadas del préstamo: {actionsError}
        </div>
      ) : null}

      <div className="space-y-3">
        <DisbursementChargesTable
          charges={loan.disbursementCharges}
          collapsible
          defaultExpanded={false}
          compact
        />

        <QuerySectionCard
          title="Plan de pagos"
          description="Vencimientos, montos y detalle de cada cuota."
          collapsible
          defaultExpanded
          aside={
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <ReceiptText className="h-3.5 w-3.5" />
              {installments.length} registro(s)
            </div>
          }
        >
            <div className="mb-2 grid gap-2 md:grid-cols-3">
              <QueryMetricCard
                label="Pendientes"
                value={String(installmentSummary.pendingCount)}
                hint="Cuotas con saldo por cobrar"
                accent={installmentSummary.pendingCount > 0 ? 'blue' : 'slate'}
              />
              <QueryMetricCard
                label="Liquidadas"
                value={String(installmentSummary.settledCount)}
                hint="Cuotas completamente pagadas"
                accent="sky"
              />
              <QueryMetricCard
                label="Total pagado"
                value={formatCurrency(installmentSummary.totalPaid)}
                hint={`Proyectado: ${formatCurrency(installmentSummary.totalProjected)}`}
                accent="blue"
              />
            </div>

            <TableContainer
              mode="legacy-compact"
              variant="strong"
              className="[&_th]:px-2 [&_td]:px-2 [&_td]:py-1"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="w-12">Acciones</th>
                      <th>#</th>
                      <th className="whitespace-nowrap">Vence original</th>
                      <th className="whitespace-nowrap">Vence ajustada</th>
                      <th className="text-right">Capital</th>
                      <th className="text-right">Interés</th>
                      <th className="text-right">Seguro</th>
                      <th className="text-right">Mora pendiente</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Pagado</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingInstallments ? (
                      <tr>
                        <td colSpan={11} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                          Cargando cuotas...
                        </td>
                      </tr>
                    ) : installmentsError ? (
                      <tr>
                        <td colSpan={11} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                          {installmentsError}
                        </td>
                      </tr>
                    ) : !installments.length ? (
                      <tr>
                        <td colSpan={11} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                          Este préstamo no tiene cuotas registradas.
                        </td>
                      </tr>
                    ) : (
                      installments.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap">
                            <TableActionButton
                              icon="view"
                              label={`Ver detalle de cuota #${item.installmentNo}`}
                              tooltip="Ver detalle de cuota"
                              onClick={() => setSelectedInstallmentNo(item.installmentNo)}
                            />
                          </td>
                          <td className="font-medium text-slate-700 dark:text-slate-200">
                            {item.installmentNo}
                          </td>
                          <td className="whitespace-nowrap">{formatDate(item.dueDateOriginal)}</td>
                          <td className="whitespace-nowrap">{formatDate(item.dueDateAdjusted)}</td>
                          <td className="whitespace-nowrap text-right">{formatCurrency(item.principalProjected)}</td>
                          <td className="whitespace-nowrap text-right">{formatCurrency(item.interestProjected)}</td>
                          <td className="whitespace-nowrap text-right">
                            {formatCurrency(getInstallmentComponentAmount(item.components, 'INSURANCE'))}
                          </td>
                          <td className="whitespace-nowrap text-right">
                            {formatCurrency(
                              item.components.find(
                                (component) => component.financialComponentCode === 'PENALTY',
                              )?.outstandingAmount ?? 0,
                            )}
                          </td>
                          <td className="whitespace-nowrap text-right">{formatCurrency(item.totalProjected)}</td>
                          <td className="whitespace-nowrap text-right">{formatCurrency(item.totalPaid)}</td>
                          <td className="whitespace-nowrap">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(item.statusCode)}`}>
                              {translateLoanApplicationStatus(item.statusCode, item.statusName)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
        </QuerySectionCard>

        {loan.insurance ? (
          <QuerySectionCard
            title="Seguro programado"
            description="Seguro cobrado y cargos futuros."
            collapsible
            defaultExpanded={false}
          >
            <LoanInsuranceSummaryContent
              totalDisbursementInsurance={loan.totalDisbursementInsurance}
              insuranceSummary={loan.insurance}
              insuranceDefinitions={loan.insurance.definitions}
            />
          </QuerySectionCard>
        ) : null}

        <QuerySectionCard
          title="Políticas informativas"
          description="Políticas de reconocimiento del préstamo."
          collapsible
          defaultExpanded={false}
        >
          <RecognitionPolicyBadges
            interestPolicyCode={loan.interestRecognitionPolicyCode}
            feePolicyCode={loan.feeRecognitionPolicyCode}
          />
        </QuerySectionCard>
      </div>

      {loan && eligibility ? (
        <LoanDisbursementReversalModal
          open={reversalModalOpen}
          loan={loan}
          eligibility={eligibility}
          isProcessing={isReversing}
          submitError={mutationError}
          onCancel={() => {
            setMutationError(null)
            setReversalModalOpen(false)
          }}
          onConfirm={async (payload) => {
            const result = await reverseDisbursement(id, payload)
            if (!result.success) {
              return
            }

            setReversalModalOpen(false)
            await Promise.all([
              loadLoan(id),
              loadInstallments(id),
              canReadEligibility ? loadEligibility(id) : Promise.resolve(),
            ])
          }}
        />
      ) : null}

      {canReadPayments ? (
        <LoanPaymentsModal
          open={paymentsModalOpen}
          loanNo={loan.loanNo?.trim() || loan.id}
          totalPaidFromSchedule={installmentSummary.totalPaid}
          items={loanPayments.items}
          totalCount={loanPayments.totalCount}
          page={loanPayments.pageNumber}
          totalPages={loanPayments.totalPages}
          isLoading={loanPayments.isLoading}
          error={loanPayments.error}
          detailsByPaymentId={loanPayments.detailsByPaymentId}
          detailLoadingByPaymentId={loanPayments.detailLoadingByPaymentId}
          detailErrorsByPaymentId={loanPayments.detailErrorsByPaymentId}
          canPrintReceipts={canPrintReceipts}
          isPrinting={receiptReport.isLoading}
          onPageChange={loanPayments.setPage}
          onLoadPaymentDetail={loanPayments.loadPaymentDetail}
          onPrintReceipt={async (payment) => {
            const result = await receiptReport.openReceipt(payment.id)
            if (!result.success) notify(result.error, 'error')
          }}
          onClose={() => setPaymentsModalOpen(false)}
        />
      ) : null}

      <InstallmentDetailModal
        open={selectedInstallmentNo !== null}
        installmentNo={selectedInstallmentNo}
        loanLabel={loanLabel}
        installment={selectedInstallment}
        isLoading={isLoadingInstallmentDetail}
        error={installmentDetailError}
        onClose={closeInstallmentModal}
      />
    </div>
  )
}

const SignalRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) => (
  <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/70">
    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  </div>
)

const formatAllowedAction = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'reverse_disbursement') return 'Revertir desembolso'
  if (normalized === 'view_anticipated_installment') return 'Ver cuota anticipada'
  if (normalized === 'apply_anticipated_installment') return 'Aplicar cuota anticipada'
  if (normalized === 'reverse_anticipated_installment_application') return 'Reversar aplicación de cuota anticipada'
  return value
}
