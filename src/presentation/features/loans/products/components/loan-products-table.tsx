import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import { AccountingStatusBadge } from '@/presentation/features/accounting/components/accounting-status-badge'

interface LoanProductsTableProps {
  items: LoanProductListItemDto[]
  isLoading: boolean
  error: string | null
  onEdit: (item: LoanProductListItemDto) => void
  onViewDetail: (item: LoanProductListItemDto) => void
  onToggleStatus: (item: LoanProductListItemDto) => void
  isProcessingId?: string | null
}

export const LoanProductsTable = ({
  items,
  isLoading,
  error,
  onEdit,
  onViewDetail,
  onToggleStatus,
  isProcessingId,
}: LoanProductsTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Moneda
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Plazo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Tipo cartera
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                  colSpan={8}
                >
                  Cargando productos...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                  colSpan={8}
                >
                  {error}
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                  colSpan={8}
                >
                  No hay productos con esos filtros.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {item.currencyCode}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {item.minAmount} - {item.maxAmount}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {item.minTerm} - {item.maxTerm} {item.termUnit}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {item.portfolioType}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <AccountingStatusBadge isActive={item.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        className="btn-icon-label"
                        onClick={() => onViewDetail(item)}
                      >
                        Detalle
                      </button>
                      <button
                        type="button"
                        className="btn-icon-label"
                        onClick={() => onEdit(item)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-icon-label"
                        onClick={() => onToggleStatus(item)}
                        disabled={isProcessingId === item.id}
                      >
                        {item.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
