import { ArrowDown, ArrowUp, Pencil, ShieldOff } from 'lucide-react'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import { TableContainer } from '@/presentation/share/components/table-container'
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
}: PaymentComponentPrioritiesTableProps) => (
  <TableContainer mode="legacy-compact" variant="strong">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {['Orden', 'Componente', 'Código', 'Estado', 'Notas'].map((label) => (
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
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Cargando prioridades...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300">
                {error}
              </td>
            </tr>
          ) : !items.length ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No hay prioridades configuradas.
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className={!item.isActive ? 'bg-red-50/60 dark:bg-red-500/5' : ''}>
                <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {(index + 1) * 10}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {formatPaymentComponentLabel(item.componentCode, item.componentName)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.componentCode}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStatusBadgeClass(item.isActive)}`}
                  >
                    {item.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                  {item.notes?.trim() || '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
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
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </TableContainer>
)
