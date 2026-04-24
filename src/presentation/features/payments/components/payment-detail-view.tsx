import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { TableContainer } from '@/presentation/share/components/table-container'
import {
  formatCurrency,
  formatDate,
  formatPaymentComponentLabel,
  getPaymentStatusBadgeClass,
  sumPaymentAllocations,
  translatePaymentApplicationStatus,
  translatePaymentStatus,
  translatePaymentType,
} from './payment-ui'

interface PaymentDetailViewProps {
  payment: PaymentResponse
  title?: string
  description?: string
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
  title = 'Detalle del pago',
  description = 'Consulta el comprobante interno y la distribución aplicada por cuota y componente.',
}: PaymentDetailViewProps) => (
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
        <InfoCard label="Préstamo" value={payment.loanNo?.trim() || '—'} />
        <InfoCard label="Cliente" value={payment.clientFullName?.trim() || '—'} />
        <InfoCard label="Monto" value={formatCurrency(payment.amount)} />
        <InfoCard label="Canal" value={payment.collectionChannelName?.trim() || '—'} />
        <InfoCard label="Tipo de pago" value={translatePaymentType(payment.paymentTypeCode, payment.paymentTypeName)} />
        <InfoCard label="Fecha operativa" value={formatDate(payment.businessDate)} />
        <InfoCard label="Fecha de pago" value={formatDate(payment.paymentDate)} />
        <InfoCard label="Referencia" value={payment.referenceNumber?.trim() || '—'} />
        <InfoCard
          label="Recibo externo"
          value={payment.externalReceiptNumber?.trim() || '—'}
        />
        <InfoCard
          label="Asiento contable"
          value={payment.journalEntryNumber?.trim() || '—'}
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
