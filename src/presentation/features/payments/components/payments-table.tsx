import { CheckCircle2, Eye, RotateCcw } from 'lucide-react'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import {
  formatCurrency,
  formatDate,
  getPaymentStatusBadgeClass,
  translatePaymentStatus,
  translatePaymentType,
} from './payment-ui'

interface PaymentsTableProps {
  items: PaymentResponse[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  actionsByPaymentId?: Record<string, PaymentActionsResponse>
  onPageChange: (page: number) => void
  onView: (payment: PaymentResponse) => void
  onEffectivize?: (payment: PaymentResponse) => void
  onReverse?: (payment: PaymentResponse) => void
}

export const PaymentsTable = ({
  items,
  isLoading,
  error,
  page,
  totalPages,
  actionsByPaymentId,
  onPageChange,
  onView,
  onEffectivize,
  onReverse,
}: PaymentsTableProps) => (
  <TableContainer mode="legacy-compact" variant="strong">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {[
              'Recibo interno',
              'Préstamo',
              'Cliente',
              'Canal',
              'Usuario registrador',
              'Fecha',
              'Tipo',
              'Estado',
              'Monto',
              'Asiento registro',
              'Asiento efectivización',
            ].map((label) => (
              <th
                key={label}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                {label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {isLoading ? (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Cargando pagos...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300">
                {error}
              </td>
            </tr>
          ) : !items.length ? (
            <tr>
              <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No hay pagos para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.internalReceiptNumber?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.loanNo?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.clientFullName?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.collectionChannelName?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.registeredByUserName?.trim() || item.registeredByUserId?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatDate(item.paymentDate)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {translatePaymentType(item.paymentTypeCode, item.paymentTypeName)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPaymentStatusBadgeClass(item.statusCode)}`}
                  >
                    {translatePaymentStatus(item.statusCode, item.statusName)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.journalEntryNumber?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.effectivizationJournalEntryNumber?.trim() || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      className="btn-table-action w-7 px-0"
                      title="Ver detalle"
                      onClick={() => onView(item)}
                    >
                      <Eye className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn-table-action w-7 px-0 disabled:cursor-not-allowed disabled:opacity-50"
                      title={getActionTitle(actionsByPaymentId?.[item.id], 'effectivize')}
                      disabled={!isActionEnabled(actionsByPaymentId?.[item.id], 'effectivize')}
                      onClick={() => onEffectivize?.(item)}
                    >
                      <CheckCircle2 className="mx-auto h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="btn-table-action w-7 px-0 disabled:cursor-not-allowed disabled:opacity-50"
                      title={getActionTitle(actionsByPaymentId?.[item.id], 'reverse')}
                      disabled={!isActionEnabled(actionsByPaymentId?.[item.id], 'reverse')}
                      onClick={() => onReverse?.(item)}
                    >
                      <RotateCcw className="mx-auto h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
  </TableContainer>
)

const isActionEnabled = (
  actions: PaymentActionsResponse | undefined,
  code: 'effectivize' | 'reverse',
) => actions?.allowedActions.find((action) => action.code === code)?.enabled ?? false

const getActionTitle = (
  actions: PaymentActionsResponse | undefined,
  code: 'effectivize' | 'reverse',
) => {
  const action = actions?.allowedActions.find((item) => item.code === code)
  if (!action) return code === 'effectivize' ? 'Efectivizar no disponible' : 'Reversar no disponible'
  if (!action.enabled) return action.reason || `${action.label} no disponible`
  return action.label
}
