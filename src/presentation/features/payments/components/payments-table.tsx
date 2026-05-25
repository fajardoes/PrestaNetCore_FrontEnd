import { CheckCircle2, Eye, RotateCcw } from 'lucide-react'
import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
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
  pageSize: number
  totalPages: number
  actionsByPaymentId?: Record<string, PaymentActionsResponse>
  onPageChange: (page: number) => void
  onView: (payment: PaymentResponse) => void
  onEffectivize?: (payment: PaymentResponse) => void
  onReverse?: (payment: PaymentResponse) => void
}

const formatShortValue = (value?: string | null) => value?.trim() || '—'

export const PaymentsTable = ({
  items,
  isLoading,
  error,
  page,
  pageSize,
  totalPages,
  actionsByPaymentId,
  onPageChange,
  onView,
  onEffectivize,
  onReverse,
}: PaymentsTableProps) => {
  const columns = [
    {
      key: 'receipt',
      header: 'Recibo interno',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {formatShortValue(item.internalReceiptNumber)}
        </span>
      ),
      getTitle: (item: PaymentResponse) => formatShortValue(item.internalReceiptNumber),
    },
    {
      key: 'loan',
      header: 'Préstamo',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => formatShortValue(item.loanNo),
      getTitle: (item: PaymentResponse) => formatShortValue(item.loanNo),
    },
    {
      key: 'client',
      header: 'Cliente',
      className: 'w-[160px]',
      render: (item: PaymentResponse) => (
        <span className="block w-[140px] whitespace-normal break-words">
          {formatShortValue(item.clientFullName)}
        </span>
      ),
      getTitle: (item: PaymentResponse) => formatShortValue(item.clientFullName),
    },
    {
      key: 'channel',
      header: 'Canal',
      className: 'w-[125px]',
      render: (item: PaymentResponse) => (
        <span className="block w-[105px] whitespace-normal break-words">
          {formatShortValue(item.collectionChannelName)}
        </span>
      ),
      getTitle: (item: PaymentResponse) => formatShortValue(item.collectionChannelName),
    },
    {
      key: 'registeredBy',
      header: 'Usuario registrador',
      className: 'w-[140px]',
      render: (item: PaymentResponse) => (
        <span className="block w-[120px] whitespace-normal break-words">
          {formatShortValue(item.registeredByUserName || item.registeredByUserId)}
        </span>
      ),
      getTitle: (item: PaymentResponse) =>
        formatShortValue(item.registeredByUserName || item.registeredByUserId),
    },
    {
      key: 'date',
      header: 'Fecha',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => formatDate(item.paymentDate),
      getTitle: (item: PaymentResponse) => formatDate(item.paymentDate),
    },
    {
      key: 'type',
      header: 'Tipo',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) =>
        translatePaymentType(item.paymentTypeCode, item.paymentTypeName),
      getTitle: (item: PaymentResponse) =>
        translatePaymentType(item.paymentTypeCode, item.paymentTypeName),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPaymentStatusBadgeClass(item.statusCode)}`}
        >
          {translatePaymentStatus(item.statusCode, item.statusName)}
        </span>
      ),
      getTitle: (item: PaymentResponse) =>
        translatePaymentStatus(item.statusCode, item.statusName),
    },
    {
      key: 'amount',
      header: 'Monto',
      className: 'whitespace-nowrap text-right',
      render: (item: PaymentResponse) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {formatCurrency(item.amount)}
        </span>
      ),
      getTitle: (item: PaymentResponse) => formatCurrency(item.amount),
    },
    {
      key: 'journalEntry',
      header: 'Asiento registro',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => formatShortValue(item.journalEntryNumber),
      getTitle: (item: PaymentResponse) => formatShortValue(item.journalEntryNumber),
    },
    {
      key: 'effectivizationEntry',
      header: 'Asiento efectivización',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) =>
        formatShortValue(item.effectivizationJournalEntryNumber),
      getTitle: (item: PaymentResponse) =>
        formatShortValue(item.effectivizationJournalEntryNumber),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: PaymentResponse) => (
        <span className="inline-flex items-center gap-1">
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
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <TableTabular
        title="Pagos"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando pagos..."
        emptyMessage={error ? 'No fue posible cargar los pagos.' : 'No hay pagos para los filtros seleccionados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * pageSize + 1}
        fitContent
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}

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
