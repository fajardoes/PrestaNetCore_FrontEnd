import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface CostCentersTableProps {
  costCenters: CostCenter[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit?: (center: CostCenter) => void
}

export const CostCentersTable = ({
  costCenters,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onEdit,
}: CostCentersTableProps) => {
  return (
    <TableContainer mode="legacy-compact">
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
                Agencia
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
                  colSpan={5}
                >
                  Cargando centros de costo...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                  colSpan={5}
                >
                  {error}
                </td>
              </tr>
            ) : !costCenters.length ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                  colSpan={5}
                >
                  No hay centros de costo con los filtros aplicados.
                </td>
              </tr>
            ) : (
              costCenters.map((center) => (
                <tr
                  key={center.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {center.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    <div className="flex flex-col">
                      <span>{center.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {center.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    {center.agencyId}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <AccountingStatusBadge isActive={center.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {onEdit ? (
                      <button
                        type="button"
                        onClick={() => onEdit(center)}
                        className="btn-table-action"
                      >
                        Editar
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </TableContainer>
  )
}
