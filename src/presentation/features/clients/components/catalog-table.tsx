import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface CatalogTableProps {
  items: ClientCatalogItem[]
  isLoading: boolean
  error: string | null
  onEdit: (catalog: ClientCatalogItem) => void
  onToggle: (catalog: ClientCatalogItem) => void
  onDelete: (catalog: ClientCatalogItem) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const CatalogTable = ({
  items,
  isLoading,
  error,
  onEdit,
  onToggle,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: CatalogTableProps) => {
  return (
    <TableContainer mode="legacy-compact">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Slug
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
                  Cargando catálogos...
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
                  No hay registros para este catálogo.
                </td>
              </tr>
            ) : (
              items.map((catalog) => (
                <tr
                  key={catalog.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {catalog.nombre}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    {catalog.slug}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                    {catalog.descripcion ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        catalog.activo
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                          : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                      }`}
                    >
                      {catalog.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onToggle(catalog)}
                        className="btn-table-action"
                      >
                        {catalog.activo ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(catalog)}
                        className="btn-table-action"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(catalog)}
                        className="btn-table-action text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
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
    </TableContainer>
  )
}
