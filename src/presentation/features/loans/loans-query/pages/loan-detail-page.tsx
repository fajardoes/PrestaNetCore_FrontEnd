import { CalendarRange, CheckCircle2, ClipboardList, ReceiptText } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'
import { DisbursementChargesTable } from '@/presentation/features/loans/components/disbursement-charges-table'
import { LoanInsuranceSummaryContent } from '@/presentation/features/loans/components/loan-insurance-summary-content'
import { DisbursementSummaryCard } from '@/presentation/features/loans/components/disbursement-summary-card'
import { RecognitionPolicyBadges } from '@/presentation/features/loans/components/recognition-policy-badges'
import { LoanDisbursementReversalEligibilityCard } from '@/presentation/features/loans/loans-query/components/loan-disbursement-reversal-eligibility-card'
import { LoanDisbursementReversalModal } from '@/presentation/features/loans/loans-query/components/loan-disbursement-reversal-modal'
import {
  QueryDetailField,
  QueryHeroCard,
  QueryMetricCard,
  QuerySectionCard,
} from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { useLoanInstallments } from '@/presentation/features/loans/loans-query/hooks/use-loan-installments'
import { useLoan } from '@/presentation/features/loans/loans-query/hooks/use-loan'
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
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { TableContainer } from '@/presentation/share/components/table-container'

export const LoanDetailPage = () => {
  const location = useLocation()
  const { id = '' } = useParams()
  const [reversalModalOpen, setReversalModalOpen] = useState(false)
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
    reverseDisbursement,
  } = useLoan()
  const {
    installments,
    isLoading: isLoadingInstallments,
    error: installmentsError,
    loadInstallments,
  } = useLoanInstallments()
  const { hasPermission } = useUserPermissions()

  const canReadEligibility = hasPermission('loans.disbursement_reversal.read_eligibility')
  const canExecuteReversal = hasPermission('loans.disbursement_reversal.execute')
  const isDisbursementAlreadyReversed =
    Boolean(loan?.isDisbursementReversed) ||
    (loan?.statusCode ?? '').trim().toUpperCase() === 'DISBURSEMENT_REVERSED'

  useEffect(() => {
    if (!id) return
    void Promise.all([
      loadLoan(id, { includeEligibility: canReadEligibility }),
      loadInstallments(id),
    ])
  }, [id, canReadEligibility, loadInstallments, loadLoan])

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
    <div className="space-y-6">
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
          <Link
            className="btn-secondary px-4 py-2 text-sm"
            to={returnTo}
            state={navigationState?.loansQueryState ? { loansQueryState: navigationState.loansQueryState } : null}
          >
            Volver a consulta
          </Link>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <QueryMetricCard
            label="Capital"
            value={formatCurrency(loan.principal)}
            hint={`Solicitud vinculada: ${loan.applicationId}`}
            accent="blue"
          />
          <QueryMetricCard
            label="Saldo cronograma"
            value={formatCurrency(installmentSummary.totalProjected - installmentSummary.totalPaid)}
            hint={`${formatMoney(paidRatio)}% del cronograma ya cubierto`}
            accent="emerald"
          />
          <QueryMetricCard
            label="Próximo vencimiento"
            value={formatDate(installmentSummary.nextDueDate)}
            hint={`${installmentSummary.pendingCount} cuota(s) pendientes`}
            accent={installmentSummary.pendingCount > 0 ? 'amber' : 'slate'}
          />
          <QueryMetricCard
            label="Tasa nominal"
            value={formatRateAsPercent(loan.nominalRate)}
            hint={`${loan.term} períodos a ${loan.paymentFrequencyName}`}
            accent="slate"
          />
        </div>
      </QueryHeroCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.95fr)]">
        <QuerySectionCard
          title="Resumen ejecutivo"
          description="Datos principales para gestión operativa, comercial y de control."
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <QueryDetailField label="No. de préstamo" value={loan.loanNo?.trim() || '—'} />
            <QueryDetailField label="ID del préstamo" value={loan.id} />
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
            />
            <QueryDetailField
              label="Producto"
              value={loan.loanProductName?.trim() || '—'}
            />
            <QueryDetailField
              label="Fecha operativa creación"
              value={formatDate(loan.createdOperationalDate)}
            />
            <QueryDetailField
              label="Fecha compromiso cronograma"
              value={formatDate(loan.scheduleCommittedOperationalDate)}
            />
            <QueryDetailField label="Versión de cronograma" value={String(loan.scheduleVersion)} />
            <QueryDetailField
              label="Primera cuota"
              value={formatDate(loan.firstDueDate)}
            />
            <QueryDetailField label="Vencimiento" value={formatDate(loan.maturityDate)} />
            <QueryDetailField label="ID cliente" value={loan.clientId} />
            <QueryDetailField label="ID producto" value={loan.loanProductId} />
          </div>
        </QuerySectionCard>

        <QuerySectionCard
          title="Indicadores de cartera"
          description="Lectura rápida del comportamiento del cronograma."
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <QueryMetricCard
                label="Cuotas registradas"
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Avance de cobro del cronograma
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatMoney(paidRatio)}%
                </span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-600 via-sky-500 to-emerald-500 transition-all"
                  style={{ width: `${Math.max(0, Math.min(paidRatio, 100))}%` }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <SignalRow
                icon={<ClipboardList className="h-4 w-4" />}
                label="Frecuencia de pago"
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
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10">
          <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
            Desembolso revertido
          </h2>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-100">
            Este préstamo quedó en estado final de reversión y debe tratarse como expediente
            cerrado para operación de cartera.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
        </section>
      )}

      <DisbursementSummaryCard data={loan} />

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
        />
      ) : null}

      {actionsError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          No fue posible resolver acciones habilitadas del préstamo: {actionsError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="space-y-6">
          <DisbursementChargesTable charges={loan.disbursementCharges} />

          <QuerySectionCard
            title="Cronograma de cuotas"
            description="Seguimiento de vencimientos, montos proyectados y acceso al detalle de cada cuota."
            aside={
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                <ReceiptText className="h-3.5 w-3.5" />
                {installments.length} registro(s)
              </div>
            }
          >
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <QueryMetricCard
                label="Pendientes"
                value={String(installmentSummary.pendingCount)}
                hint="Cuotas con saldo por cobrar"
                accent={installmentSummary.pendingCount > 0 ? 'amber' : 'slate'}
              />
              <QueryMetricCard
                label="Liquidadas"
                value={String(installmentSummary.settledCount)}
                hint="Cuotas completamente pagadas"
                accent="emerald"
              />
              <QueryMetricCard
                label="Total pagado"
                value={formatCurrency(installmentSummary.totalPaid)}
                hint={`Proyectado: ${formatCurrency(installmentSummary.totalProjected)}`}
                accent="blue"
              />
            </div>

            <TableContainer mode="legacy-compact" variant="strong">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Vence original</th>
                      <th>Vence ajustada</th>
                      <th className="text-right">Capital</th>
                      <th className="text-right">Interés</th>
                      <th className="text-right">Seguro</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Pagado</th>
                      <th>Estado</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingInstallments ? (
                      <tr>
                        <td colSpan={10} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                          Cargando cuotas...
                        </td>
                      </tr>
                    ) : installmentsError ? (
                      <tr>
                        <td colSpan={10} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                          {installmentsError}
                        </td>
                      </tr>
                    ) : !installments.length ? (
                      <tr>
                        <td colSpan={10} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                          Este préstamo no tiene cuotas registradas.
                        </td>
                      </tr>
                    ) : (
                      installments.map((item) => (
                        <tr key={item.id}>
                          <td className="font-medium text-slate-700 dark:text-slate-200">
                            {item.installmentNo}
                          </td>
                          <td>{formatDate(item.dueDateOriginal)}</td>
                          <td>{formatDate(item.dueDateAdjusted)}</td>
                          <td className="text-right">{formatMoney(item.principalProjected)}</td>
                          <td className="text-right">{formatMoney(item.interestProjected)}</td>
                          <td className="text-right">
                            {formatMoney(getInstallmentComponentAmount(item.components, 'INSURANCE'))}
                          </td>
                          <td className="text-right">{formatMoney(item.totalProjected)}</td>
                          <td className="text-right">{formatMoney(item.totalPaid)}</td>
                          <td>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(item.statusCode)}`}>
                              {translateLoanApplicationStatus(item.statusCode, item.statusName)}
                            </span>
                          </td>
                          <td className="text-right">
                            <Link
                              to={`/loans/${loan.id}/installments/${item.installmentNo}`}
                              className="btn-table-action inline-flex px-2"
                            >
                              Ver
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </QuerySectionCard>
        </div>

        <div className="space-y-6">
          {loan.insurance ? (
            <QuerySectionCard
              title="Seguro programado"
              description="Resumen del seguro cobrado al desembolso y de los cargos futuros asociados al préstamo."
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
            description="Referencias de reconocimiento asociadas al préstamo."
          >
            <RecognitionPolicyBadges
              interestPolicyCode={loan.interestRecognitionPolicyCode}
              feePolicyCode={loan.feeRecognitionPolicyCode}
            />
          </QuerySectionCard>
        </div>
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
              loadLoan(id, { includeEligibility: canReadEligibility }),
              loadInstallments(id),
            ])
          }}
        />
      ) : null}
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
  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  </div>
)

const formatAllowedAction = (value: string) => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'reverse_disbursement') return 'Revertir desembolso'
  return value
}
