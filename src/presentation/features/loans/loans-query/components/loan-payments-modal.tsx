import { ChevronDown, ChevronUp, History, LoaderCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { formatCurrency, formatDate } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import {
  formatPaymentComponentLabel,
  getPaymentStatusBadgeClass,
  sumPaymentAllocations,
  translatePaymentApplicationStatus,
  translatePaymentFlow,
  translatePaymentStatus,
  translatePaymentType,
} from '@/presentation/features/payments/components/payment-ui'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LoanPaymentsModalProps {
  open: boolean
  loanNo: string
  totalPaidFromSchedule: number
  items: PaymentResponse[]
  totalCount: number
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  detailsByPaymentId: Record<string, PaymentResponse>
  detailLoadingByPaymentId: Record<string, boolean>
  detailErrorsByPaymentId: Record<string, string | null>
  onPageChange: (page: number) => void
  onLoadPaymentDetail: (paymentId: string) => Promise<void>
  onClose: () => void
}

export const LoanPaymentsModal = ({
  open,
  loanNo,
  totalPaidFromSchedule,
  items,
  totalCount,
  page,
  totalPages,
  isLoading,
  error,
  detailsByPaymentId,
  detailLoadingByPaymentId,
  detailErrorsByPaymentId,
  onPageChange,
  onLoadPaymentDetail,
  onClose,
}: LoanPaymentsModalProps) => {
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) setExpandedPaymentId(null)
  }, [open])

  if (!open) return null

  const togglePayment = (paymentId: string) => {
    const isExpanded = expandedPaymentId === paymentId
    setExpandedPaymentId(isExpanded ? null : paymentId)
    if (!isExpanded && !detailsByPaymentId[paymentId]) {
      void onLoadPaymentDetail(paymentId)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="loan-payments-modal-title"
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 id="loan-payments-modal-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Pagos recibidos
              </h2>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Historial de pagos del préstamo {loanNo || '—'}. Expande un registro para ver las cuotas y componentes afectados.
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar pagos recibidos">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryCard label="Pagos registrados" value={String(totalCount)} hint="Incluye el historial visible para tu usuario." />
            <SummaryCard label="Total aplicado al cronograma" value={formatCurrency(totalPaidFromSchedule)} hint="Consolidado actual de cuotas y componentes." />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
              {error}
            </div>
          ) : null}

          {isLoading && items.length ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">Actualizando listado de pagos...</p>
          ) : null}

          <TableContainer mode="legacy-compact" variant="strong">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Detalle</th>
                    <th>Fecha</th>
                    <th>Recibo interno</th>
                    <th>Tipo / flujo</th>
                    <th className="text-right">Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading && !items.length ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-8 text-center text-slate-500 dark:text-slate-400">
                        Cargando pagos...
                      </td>
                    </tr>
                  ) : !items.length ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-8 text-center text-slate-500 dark:text-slate-400">
                        {error ? 'No fue posible cargar los pagos.' : 'Este préstamo no tiene pagos registrados.'}
                      </td>
                    </tr>
                  ) : (
                    items.map((payment) => {
                      const isExpanded = expandedPaymentId === payment.id
                      const detail = detailsByPaymentId[payment.id]
                      const detailError = detailErrorsByPaymentId[payment.id]
                      const isLoadingDetail = detailLoadingByPaymentId[payment.id]

                      return (
                        <PaymentRow
                          key={payment.id}
                          payment={payment}
                          detail={detail}
                          detailError={detailError}
                          isExpanded={isExpanded}
                          isLoadingDetail={isLoadingDetail}
                          onToggle={() => togglePayment(payment.id)}
                        />
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TableContainer>

          {items.length ? (
            <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          ) : null}
        </div>

        <div className="flex justify-end border-t border-slate-200 px-5 py-4 dark:border-slate-800">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

const PaymentRow = ({
  payment,
  detail,
  detailError,
  isExpanded,
  isLoadingDetail,
  onToggle,
}: {
  payment: PaymentResponse
  detail?: PaymentResponse
  detailError?: string | null
  isExpanded: boolean
  isLoadingDetail?: boolean
  onToggle: () => void
}) => (
  <>
    <tr className={isExpanded ? 'bg-slate-50 dark:bg-slate-900/70' : undefined}>
      <td>
        <button
          type="button"
          className="btn-table-action inline-flex items-center gap-1.5"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Ocultar' : 'Ver'} componentes del pago ${payment.internalReceiptNumber?.trim() || payment.id}`}
        >
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
          {isExpanded ? 'Ocultar' : 'Ver componentes'}
        </button>
      </td>
      <td>{formatDate(payment.paymentDate)}</td>
      <td className="font-medium text-slate-800 dark:text-slate-100">
        {payment.internalReceiptNumber?.trim() || '—'}
      </td>
      <td>
        <div>{translatePaymentType(payment.paymentTypeCode, payment.paymentTypeName)}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          {translatePaymentFlow(payment.paymentFlowCode, payment.paymentFlowName)}
        </div>
      </td>
      <td className="text-right font-semibold">{formatCurrency(payment.amount)}</td>
      <td>
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getPaymentStatusBadgeClass(payment.statusCode)}`}>
          {translatePaymentStatus(payment.statusCode, payment.statusName)}
        </span>
      </td>
    </tr>
    {isExpanded ? (
      <tr>
        <td colSpan={6} className="bg-slate-50 dark:bg-slate-900/70">
          <PaymentAllocations detail={detail} error={detailError} isLoading={isLoadingDetail} />
        </td>
      </tr>
    ) : null}
  </>
)

const PaymentAllocations = ({
  detail,
  error,
  isLoading,
}: {
  detail?: PaymentResponse
  error?: string | null
  isLoading?: boolean
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-4 text-sm text-slate-500 dark:text-slate-400">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        Cargando distribución del pago...
      </div>
    )
  }

  if (error) {
    return <p className="px-2 py-4 text-sm text-red-700 dark:text-red-300">{error}</p>
  }

  if (!detail) {
    return <p className="px-2 py-4 text-sm text-slate-500 dark:text-slate-400">No fue posible cargar el detalle del pago.</p>
  }

  return (
    <div className="space-y-3 p-2">
      <div className="grid gap-2 md:grid-cols-3">
        <SummaryCard label="Estado de aplicación" value={translatePaymentApplicationStatus(detail.applicationStatusCode)} />
        <SummaryCard label="Total del pago" value={formatCurrency(detail.amount)} />
        <SummaryCard label="Total aplicado" value={formatCurrency(sumPaymentAllocations(detail))} />
      </div>

      {detail.allocations.length ? (
        <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white dark:bg-slate-950">
                <th className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cuota</th>
                <th className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Componente</th>
                <th className="px-2.5 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Monto aplicado</th>
                <th className="px-2.5 py-1.5 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Orden</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {detail.allocations.map((allocation) => (
                <tr key={allocation.id}>
                  <td className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200">#{allocation.installmentNo}</td>
                  <td className="px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200">{formatPaymentComponentLabel(allocation.componentCode, allocation.componentName)}</td>
                  <td className="px-2.5 py-1.5 text-right text-xs font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(allocation.amount)}</td>
                  <td className="px-2.5 py-1.5 text-right text-xs text-slate-600 dark:text-slate-300">{allocation.allocationOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
          Este pago todavía no tiene aplicaciones registradas en el cronograma.
        </p>
      )}
    </div>
  )
}

const SummaryCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
  </div>
)
