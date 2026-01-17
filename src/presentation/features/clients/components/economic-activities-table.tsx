import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface EconomicActivitiesTableProps {
  items: EconomicActivityCatalog[]
  isLoading: boolean
  error: string | null
  onEdit: (activity: EconomicActivityCatalog) => void
  onToggle: (activity: EconomicActivityCatalog) => void
  onDelete: (activity: EconomicActivityCatalog) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const EconomicActivitiesTable = ({
  items,
  isLoading,
  error,
  onEdit,
  onToggle,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: EconomicActivitiesTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Sector
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Descripción
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
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                >
                  Cargando actividades...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                >
                  {error}
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                >
                  No hay actividades económicas registradas.
                </td>
              </tr>
            ) : (
              items.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {activity.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    {activity.sectorNombre ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {activity.descripcion ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        activity.activo
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                          : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                      }`}
                    >
                      {activity.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggle(activity)}
                        className="btn-icon-label text-xs"
                      >
                        {activity.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(activity)}
                        className="btn-icon-label text-xs"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(activity)}
                        className="btn-icon-label text-xs text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                      >
                        Borrar
                      </button>
                    </div>
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
    </div>
  )
}
