import { Pencil, Power } from 'lucide-react'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import { TableContainer } from '@/presentation/share/components/table-container'

interface CollectionChannelTypesTableProps {
  items: CollectionChannelTypeResponse[]
  isLoading: boolean
  error: string | null
  canUpdate: boolean
  onEdit: (item: CollectionChannelTypeResponse) => void
  onToggleStatus: (item: CollectionChannelTypeResponse) => void
}

export const CollectionChannelTypesTable = ({
  items,
  isLoading,
  error,
  canUpdate,
  onEdit,
  onToggleStatus,
}: CollectionChannelTypesTableProps) => {
  return (
    <TableContainer mode="legacy-compact" variant="strong">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {['Código', 'Nombre', 'Descripción', 'Orden', 'Estado', 'Acciones'].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Cargando tipos de canal...
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
                  No hay tipos de canal registrados.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900">
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                    {item.description?.trim() || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{item.sortOrder}</td>
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
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {canUpdate ? (
                        <>
                          <button
                            type="button"
                            className="btn-table-action w-7 px-0"
                            title="Editar tipo"
                            onClick={() => onEdit(item)}
                          >
                            <Pencil className="mx-auto h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="btn-table-action w-7 px-0"
                            title={item.isActive ? 'Desactivar tipo' : 'Activar tipo'}
                            onClick={() => onToggleStatus(item)}
                          >
                            <Power className="mx-auto h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500">Sin acción</span>
                      )}
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
}
