import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'
import { TablePagination } from '@/presentation/share/components/table-pagination'

export interface MenuRow {
  item: MenuItemAdminDto
  depth: number
}

interface MenusTableProps {
  rows: MenuRow[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (item: MenuItemAdminDto) => void
  onDelete: (item: MenuItemAdminDto) => void
}

const getIndentLabel = (depth: number) => {
  if (depth <= 0) return ''
  return `${'--'.repeat(depth)} `
}

export const MenusTable = ({
  rows,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: MenusTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Menu
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Ruta
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Orden
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
                  Cargando menus...
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
            ) : !rows.length ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                  colSpan={5}
                >
                  No hay menus registrados.
                </td>
              </tr>
            ) : (
              rows.map(({ item, depth }) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                >
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                    <div className="font-semibold">
                      {getIndentLabel(depth)}
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    {item.route ?? 'Contenedor'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    {item.order}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        item.isActive
                          ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                          : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                      }`}
                    >
                      {item.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="btn-icon-label"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="btn-icon"
                        aria-label="Eliminar menu"
                      >
                        <TrashIcon className="h-4 w-4" />
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

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
  </svg>
)
