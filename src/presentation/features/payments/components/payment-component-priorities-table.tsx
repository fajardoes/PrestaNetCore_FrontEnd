import { ArrowDown, ArrowUp, Pencil, ShieldOff } from 'lucide-react'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import {
  formatPaymentComponentLabel,
  getPriorityStatusBadgeClass,
} from './payment-ui'

interface PaymentComponentPrioritiesTableProps {
  items: PaymentComponentPriorityResponse[]
  isLoading: boolean
  error: string | null
  canManage: boolean
  onEdit: (item: PaymentComponentPriorityResponse) => void
  onDeactivate: (item: PaymentComponentPriorityResponse) => void
  onMoveUp: (itemId: string) => void
  onMoveDown: (itemId: string) => void
}

export const PaymentComponentPrioritiesTable = ({
  items,
  isLoading,
  error,
  canManage,
  onEdit,
  onDeactivate,
  onMoveUp,
  onMoveDown,
}: PaymentComponentPrioritiesTableProps) => {
  const columns = [
    {
      key: 'order',
      header: 'Orden',
      className: 'whitespace-nowrap text-right',
      render: (_item: PaymentComponentPriorityResponse, index: number) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {(index + 1) * 10}
        </span>
      ),
      getTitle: (_item: PaymentComponentPriorityResponse, index: number) =>
        String((index + 1) * 10),
    },
    {
      key: 'component',
      header: 'Componente',
      className: 'whitespace-nowrap',
      render: (item: PaymentComponentPriorityResponse) =>
        formatPaymentComponentLabel(item.componentCode, item.componentName),
      getTitle: (item: PaymentComponentPriorityResponse) =>
        formatPaymentComponentLabel(item.componentCode, item.componentName),
    },
    {
      key: 'code',
      header: 'Código',
      className: 'whitespace-nowrap',
      render: (item: PaymentComponentPriorityResponse) => item.componentCode,
      getTitle: (item: PaymentComponentPriorityResponse) => item.componentCode,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'whitespace-nowrap',
      render: (item: PaymentComponentPriorityResponse) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStatusBadgeClass(item.isActive)}`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (item: PaymentComponentPriorityResponse) =>
        item.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'notes',
      header: 'Notas',
      className: 'w-[290px]',
      render: (item: PaymentComponentPriorityResponse) => (
        <span className="block w-[270px] whitespace-normal break-words text-slate-700 dark:text-slate-200">
          {item.notes?.trim() || '—'}
        </span>
      ),
      getTitle: (item: PaymentComponentPriorityResponse) => item.notes?.trim() || '—',
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: PaymentComponentPriorityResponse, index: number) => (
        <span className="inline-flex items-center gap-1">
          {canManage ? (
            <>
              <button
                type="button"
                className="btn-table-action w-7 px-0"
                title="Subir prioridad"
                disabled={index === 0}
                onClick={() => onMoveUp(item.id)}
              >
                <ArrowUp className="mx-auto h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="btn-table-action w-7 px-0"
                title="Bajar prioridad"
                disabled={index === items.length - 1}
                onClick={() => onMoveDown(item.id)}
              >
                <ArrowDown className="mx-auto h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="btn-table-action w-7 px-0"
                title="Editar prioridad"
                onClick={() => onEdit(item)}
              >
                <Pencil className="mx-auto h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="btn-table-action w-7 px-0 disabled:cursor-not-allowed disabled:opacity-50"
                title="Desactivar prioridad"
                disabled={!item.isActive}
                onClick={() => onDeactivate(item)}
              >
                <ShieldOff className="mx-auto h-3.5 w-3.5" />
              </button>
            </>
          ) : null}
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
        title="Prioridades de cobro"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando prioridades..."
        emptyMessage={error ? 'No fue posible cargar las prioridades.' : 'No hay prioridades configuradas.'}
        maxHeightClassName="max-h-[640px]"
        getRowClassName={(item) =>
          !item.isActive ? 'bg-red-50/60 dark:bg-red-500/5' : ''
        }
      />
    </div>
  )
}
