import { CheckCircle2, Printer, RotateCcw, XCircle } from 'lucide-react'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import type { PaymentReversalResponse } from '@/infrastructure/payments/responses/payment-reversal-response'
import { TableContainer } from '@/presentation/share/components/table-container'
import { BankPaymentProofDocumentPanel } from './bank-payment-proof-document-panel'
import {
  formatBankEntityDisplay,
  formatCurrency,
  formatDate,
  formatPaymentComponentLabel,
  getPaymentStatusBadgeClass,
  isPaymentReceiptPrintable,
  sumPaymentAllocations,
  translatePaymentApplicationStatus,
  translatePaymentFlow,
  translatePaymentStatus,
  translatePaymentType,
} from './payment-ui'

interface PaymentDetailViewProps {
  payment: PaymentResponse
  actions?: PaymentActionsResponse | null
  actionsError?: string | null
  reversal?: PaymentReversalResponse | null
  reversalError?: string | null
  title?: string
  description?: string
  onEffectivize?: () => void
  onSettle?: () => void
  onReject?: () => void
  onReverse?: () => void
  onPrintReceipt?: () => void
  bankProofReviewed?: boolean
  isPreviewingBankProof?: boolean
  isDownloadingBankProof?: boolean
  bankProofDocumentError?: string | null
  onPreviewBankProof?: () => void
  onDownloadBankProof?: () => void
}

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">{value}</p>
  </div>
)

export const PaymentDetailView = ({
  payment,
  actions,
  actionsError,
  reversal,
  reversalError,
  title = 'Detalle del pago',
  description = 'Consulta el comprobante interno y la distribución aplicada por cuota y componente.',
  onEffectivize,
  onSettle,
  onReject,
  onReverse,
  onPrintReceipt,
  bankProofReviewed,
  isPreviewingBankProof,
  isDownloadingBankProof,
  bankProofDocumentError,
  onPreviewBankProof,
  onDownloadBankProof,
}: PaymentDetailViewProps) => {
  const effectivizeAction = actions?.allowedActions.find((action) => action.code === 'effectivize')
  const settleAction = actions?.allowedActions.find((action) => action.code === 'settle')
  const rejectAction = actions?.allowedActions.find((action) => action.code === 'reject')
  const reverseAction = actions?.allowedActions.find((action) => action.code === 'reverse')
  const isBankProof = payment.paymentFlowCode?.trim().toUpperCase() === 'BANK_PROOF'
  const isCashCollection = payment.paymentFlowCode?.trim().toUpperCase() === 'CASH_COLLECTION'

  return (
  <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getPaymentStatusBadgeClass(payment.statusCode)}`}
          >
            {translatePaymentStatus(payment.statusCode, payment.statusName)}
          </span>
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100">
            {translatePaymentApplicationStatus(payment.applicationStatusCode)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Recibo interno"
          value={payment.internalReceiptNumber?.trim() || '—'}
        />
        <InfoCard label="Flujo" value={translatePaymentFlow(payment.paymentFlowCode, payment.paymentFlowName)} />
        <InfoCard label="Préstamo" value={payment.loanNo?.trim() || '—'} />
        <InfoCard label="Cliente" value={payment.clientFullName?.trim() || '—'} />
        <InfoCard label="Monto" value={formatCurrency(payment.amount)} />
        <InfoCard label="Canal" value={payment.collectionChannelName?.trim() || '—'} />
        <InfoCard label="Usuario registrador" value={payment.registeredByUserName?.trim() || payment.registeredByUserId?.trim() || '—'} />
        <InfoCard label="Tipo de pago" value={translatePaymentType(payment.paymentTypeCode, payment.paymentTypeName)} />
        <InfoCard label="Fecha operativa" value={formatDate(payment.businessDate)} />
        <InfoCard label="Fecha de pago" value={formatDate(payment.paymentDate)} />
        <InfoCard label="Referencia" value={payment.referenceNumber?.trim() || '—'} />
        <InfoCard
          label="Recibo externo"
          value={payment.externalReceiptNumber?.trim() || '—'}
        />
        <InfoCard
          label="Asiento de registro"
          value={payment.journalEntryNumber?.trim() || '—'}
        />
        <InfoCard
          label="Asiento de efectivización"
          value={payment.effectivizationJournalEntryNumber?.trim() || '—'}
        />
        <InfoCard
          label="Total aplicado"
          value={formatCurrency(sumPaymentAllocations(payment))}
        />
      </div>

      {payment.notes?.trim() ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Notas
          </p>
          <p className="mt-1 leading-6">{payment.notes}</p>
        </div>
      ) : null}
    </section>

    {isBankProof ? (
      <BankPaymentProofDocumentPanel
        document={payment.bankDepositProofDocument}
        isReviewed={bankProofReviewed}
        isPreviewing={isPreviewingBankProof}
        isDownloading={isDownloadingBankProof}
        error={bankProofDocumentError}
        onPreview={onPreviewBankProof ?? (() => undefined)}
        onDownload={onDownloadBankProof ?? (() => undefined)}
      />
    ) : null}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Efectivización
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Fecha de efectivización"
          value={formatDate(payment.effectivizationDate)}
        />
        <InfoCard
          label="Fecha operativa de efectivización"
          value={formatDate(payment.effectivizationBusinessDate)}
        />
        {isBankProof ? (
          <InfoCard
            label="Banco reportado"
            value={
              payment.reportedBankEntityId
                ? formatBankEntityDisplay(
                    payment.reportedBankEntityCode,
                    payment.reportedBankEntityName,
                  )
                : 'Banco no especificado por capturista'
            }
          />
        ) : null}
        {isBankProof ? (
          <InfoCard
            label="Banco confirmado"
            value={formatBankEntityDisplay(
              payment.approvedBankEntityCode,
              payment.approvedBankEntityName,
            )}
          />
        ) : null}
        <InfoCard
          label="Cuenta banco"
          value={
            payment.bankGlAccountCode || payment.bankGlAccountName
              ? `${payment.bankGlAccountCode ?? ''} ${payment.bankGlAccountName ?? ''}`.trim()
              : '—'
          }
        />
        <InfoCard
          label="Referencia bancaria"
          value={payment.bankReferenceNumber?.trim() || '—'}
        />
        <InfoCard
          label="Referencia reportada"
          value={payment.reportedBankReferenceNumber?.trim() || '—'}
        />
        <InfoCard
          label="Fecha de depósito"
          value={formatDate(payment.bankDepositDate)}
        />
        <InfoCard
          label="Fecha reportada"
          value={formatDate(payment.reportedBankDepositDate)}
        />
        <InfoCard
          label="Asiento de efectivización"
          value={payment.effectivizationJournalEntryNumber?.trim() || '—'}
        />
      </div>
      {payment.effectivizationNotes?.trim() ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Notas de efectivización
          </p>
          <p className="mt-1 leading-6">{payment.effectivizationNotes}</p>
        </div>
      ) : null}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Acciones permitidas
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            La disponibilidad proviene del endpoint de acciones del pago.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isCashCollection ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!settleAction?.enabled}
              title={!settleAction?.enabled ? settleAction?.reason || 'No disponible' : 'Liquidar'}
              onClick={onSettle}
            >
              <CheckCircle2 className="h-4 w-4" />
              Liquidar
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!effectivizeAction?.enabled}
              title={!effectivizeAction?.enabled ? effectivizeAction?.reason || 'No disponible' : 'Efectivizar'}
              onClick={onEffectivize}
            >
              <CheckCircle2 className="h-4 w-4" />
              {isBankProof ? 'Aprobar' : 'Efectivizar'}
            </button>
          )}
          {isBankProof ? (
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!rejectAction?.enabled}
              title={!rejectAction?.enabled ? rejectAction?.reason || 'No disponible' : 'Rechazar'}
              onClick={onReject}
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </button>
          ) : null}
          <button
            type="button"
            className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!reverseAction?.enabled}
            title={!reverseAction?.enabled ? reverseAction?.reason || 'No disponible' : 'Reversar'}
            onClick={onReverse}
          >
            <RotateCcw className="h-4 w-4" />
            Reversar
          </button>
          {isPaymentReceiptPrintable(payment) ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={onPrintReceipt}
            >
              <Printer className="h-4 w-4" />
              Imprimir recibo
            </button>
          ) : null}
        </div>
      </div>

      {actionsError ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-300">{actionsError}</p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {(actions?.allowedActions ?? []).map((action) => (
          <div
            key={action.code}
            className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {action.label}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {action.enabled ? 'Disponible' : action.reason || 'No disponible'}
            </p>
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Contabilidad funcional
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <AccountingNote title="Registro de pago" items={['DR Recaudación en tránsito', 'CR Intereses por cobrar / Cartera vigente / Seguro, según allocations']} />
        <AccountingNote title="Efectivización" items={['DR Banco seleccionado', 'CR Recaudación en tránsito']} />
        <AccountingNote title="Reversa de registrado" items={['DR Componentes por cobrar', 'CR Recaudación en tránsito']} />
        <AccountingNote title="Reversa de efectivizado" items={['DR Recaudación en tránsito / CR Banco', 'DR Componentes por cobrar / CR Recaudación en tránsito']} />
      </div>
    </section>

    {payment.statusCode === 'REVERSED' || reversal || reversalError ? (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Reversa
        </h3>
        {reversalError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-300">{reversalError}</p>
        ) : reversal ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoCard label="Estado original" value={translatePaymentStatus(reversal.originalStatusCode)} />
            <InfoCard label="Fecha de reversa" value={formatDate(reversal.reversalDate)} />
            <InfoCard label="Fecha operativa" value={formatDate(reversal.businessDate)} />
            <InfoCard label="Monto" value={formatCurrency(reversal.amount)} />
            <InfoCard label="Asiento reversa registro" value={reversal.registrationReversalJournalEntryNumber || '—'} />
            <InfoCard label="Asiento reversa efectivización" value={reversal.effectivizationReversalJournalEntryNumber || '—'} />
            <InfoCard label="Exposición canal" value={formatCurrency(reversal.channelOutstandingAmount)} />
            <InfoCard label="Exposición usuario" value={formatCurrency(reversal.userOutstandingAmount)} />
            <div className="md:col-span-2 xl:col-span-4">
              <InfoCard label="Motivo" value={reversal.reason || '—'} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            No hay reversa registrada.
          </p>
        )}
      </section>
    ) : null}

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Allocations aplicados
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Distribución entregada por backend; el frontend no recalcula estos valores.
          </p>
        </div>
      </div>

      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {['Orden', 'Cuota', 'Componente', 'Monto'].map((label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {!payment.allocations.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No hay allocations para mostrar.
                  </td>
                </tr>
              ) : (
                payment.allocations.map((allocation) => (
                  <tr key={allocation.id}>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {allocation.allocationOrder}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {allocation.installmentNo}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {formatPaymentComponentLabel(
                        allocation.componentCode,
                        allocation.componentName,
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {formatCurrency(allocation.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>
    </section>
  </div>
)
}

const AccountingNote = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
    <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)
