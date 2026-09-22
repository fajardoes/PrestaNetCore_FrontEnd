import type { PaymentActionsResponse } from '@/infrastructure/payments/responses/payment-actions-response'
import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableActionButton } from '@/presentation/share/components/table-action-button'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import {
  formatBankEntityDisplay,
  formatCurrency,
  formatDate,
  getPaymentStatusBadgeClass,
  translatePaymentStatus,
  translatePaymentType,
} from './payment-ui'
import { isPaymentReceiptPrintable } from './payment-ui'

interface PaymentsTableProps {
  items: PaymentResponse[]
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalPages: number
  actionsByPaymentId?: Record<string, PaymentActionsResponse>
  showBankColumns?: boolean
  onPageChange: (page: number) => void
  onView: (payment: PaymentResponse) => void
  onEffectivize?: (payment: PaymentResponse) => void
  onSettle?: (payment: PaymentResponse) => void
  onReject?: (payment: PaymentResponse) => void
  onReverse?: (payment: PaymentResponse) => void
  onPrintReceipt?: (payment: PaymentResponse) => void
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
  showBankColumns,
  onPageChange,
  onView,
  onEffectivize,
  onSettle,
  onReject,
  onReverse,
  onPrintReceipt,
}: PaymentsTableProps) => {
  const columns = [
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: PaymentResponse) => (
        <span className="inline-flex items-center gap-1">
          <TableActionButton
            icon="view"
            label="Ver detalle"
            tooltip="Ver detalle"
            onClick={() => onView(item)}
          />
          {isActionEnabled(actionsByPaymentId?.[item.id], 'settle') ? (
            <TableActionButton
              icon="post"
              label="Liquidar pago"
              tooltip="Liquidar pago"
              onClick={() => onSettle?.(item)}
            />
          ) : null}
          {isActionEnabled(actionsByPaymentId?.[item.id], 'effectivize') ? (
            <TableActionButton
              icon="post"
              label="Aprobar abono"
              tooltip="Aprobar abono"
              onClick={() => onEffectivize?.(item)}
            />
          ) : null}
          {isActionEnabled(actionsByPaymentId?.[item.id], 'reject') ? (
            <TableActionButton
              icon="void"
              label="Rechazar abono"
              tooltip="Rechazar abono"
              onClick={() => onReject?.(item)}
            />
          ) : null}
          {isActionEnabled(actionsByPaymentId?.[item.id], 'reverse') ? (
            <TableActionButton
              icon="reverse"
              label="Reversar pago"
              tooltip="Reversar pago"
              onClick={() => onReverse?.(item)}
            />
          ) : null}
          {isPaymentReceiptPrintable(item) ? (
            <TableActionButton
              icon="print"
              label="Imprimir recibo"
              tooltip="Imprimir recibo"
              onClick={() => onPrintReceipt?.(item)}
            />
          ) : null}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => (
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-4 ${getPaymentStatusBadgeClass(item.statusCode)}`}
        >
          {translatePaymentStatus(item.statusCode, item.statusName)}
        </span>
      ),
      getTitle: (item: PaymentResponse) =>
        translatePaymentStatus(item.statusCode, item.statusName),
    },
    {
      key: 'receipt',
      header: 'Recibo interno',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => (
        <span className="font-mono text-[12px] text-slate-700 dark:text-slate-200">
          {formatShortValue(item.internalReceiptNumber)}
        </span>
      ),
      getTitle: (item: PaymentResponse) => formatShortValue(item.internalReceiptNumber),
    },
    {
      key: 'loan',
      header: 'Préstamo',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => (
        <span className="font-mono text-[12px] text-slate-700 dark:text-slate-200">
          {formatShortValue(item.loanNo)}
        </span>
      ),
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
    ...(showBankColumns
      ? [
          {
            key: 'reportedBank',
            header: 'Banco reportado',
            className: 'w-[150px]',
            render: (item: PaymentResponse) => (
              <span className="block w-[130px] whitespace-normal break-words">
                {formatBankEntityDisplay(
                  item.reportedBankEntityCode,
                  item.reportedBankEntityName,
                  'No especificado',
                )}
              </span>
            ),
            getTitle: (item: PaymentResponse) =>
              formatBankEntityDisplay(
                item.reportedBankEntityCode,
                item.reportedBankEntityName,
                'No especificado',
              ),
          },
          {
            key: 'approvedBank',
            header: 'Banco confirmado',
            className: 'w-[150px]',
            render: (item: PaymentResponse) => (
              <span className="block w-[130px] whitespace-normal break-words">
                {formatBankEntityDisplay(item.approvedBankEntityCode, item.approvedBankEntityName)}
              </span>
            ),
            getTitle: (item: PaymentResponse) =>
              formatBankEntityDisplay(item.approvedBankEntityCode, item.approvedBankEntityName),
          },
          {
            key: 'bankAccount',
            header: 'Cuenta banco',
            className: 'w-[170px]',
            render: (item: PaymentResponse) => (
              <span className="block w-[150px] whitespace-normal break-words">
                {item.bankGlAccountCode || item.bankGlAccountName
                  ? `${item.bankGlAccountCode ?? ''} ${item.bankGlAccountName ?? ''}`.trim()
                  : '—'}
              </span>
            ),
            getTitle: (item: PaymentResponse) =>
              item.bankGlAccountCode || item.bankGlAccountName
                ? `${item.bankGlAccountCode ?? ''} ${item.bankGlAccountName ?? ''}`.trim()
                : '—',
          },
        ]
      : []),
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
      render: (item: PaymentResponse) => (
        <span className="font-mono text-[12px] text-slate-700 dark:text-slate-200">
          {formatShortValue(item.journalEntryNumber)}
        </span>
      ),
      getTitle: (item: PaymentResponse) => formatShortValue(item.journalEntryNumber),
    },
    {
      key: 'effectivizationEntry',
      header: 'Asiento efectivización',
      className: 'whitespace-nowrap',
      render: (item: PaymentResponse) => (
        <span className="font-mono text-[12px] text-slate-700 dark:text-slate-200">
          {formatShortValue(item.effectivizationJournalEntryNumber)}
        </span>
      ),
      getTitle: (item: PaymentResponse) =>
        formatShortValue(item.effectivizationJournalEntryNumber),
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
        getRowClassName={() =>
          'odd:bg-white even:bg-slate-50/70 hover:bg-sky-50/70 dark:odd:bg-slate-950 dark:even:bg-slate-900/70 dark:hover:bg-slate-900'
        }
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
  code: string,
) => actions?.allowedActions.find((action) => action.code === code)?.enabled ?? false

