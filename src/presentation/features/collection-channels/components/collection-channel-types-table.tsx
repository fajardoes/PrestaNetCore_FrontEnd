import { Pencil, Power } from 'lucide-react'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import { TableTabular } from '@/presentation/share/components/table-tabular'

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
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelTypeResponse) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {item.code}
        </span>
      ),
      getTitle: (item: CollectionChannelTypeResponse) => item.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelTypeResponse) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {item.name}
        </span>
      ),
      getTitle: (item: CollectionChannelTypeResponse) => item.name,
    },
    {
      key: 'description',
      header: 'Descripción',
      className: 'w-[295px]',
      render: (item: CollectionChannelTypeResponse) => (
        <span className="block w-[275px] whitespace-normal break-words text-slate-700 dark:text-slate-200">
          {item.description?.trim() || '—'}
        </span>
      ),
      getTitle: (item: CollectionChannelTypeResponse) =>
        item.description?.trim() || '—',
    },
    {
      key: 'order',
      header: 'Orden',
      className: 'whitespace-nowrap text-right',
      render: (item: CollectionChannelTypeResponse) => item.sortOrder,
      getTitle: (item: CollectionChannelTypeResponse) => String(item.sortOrder),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelTypeResponse) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            item.isActive
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (item: CollectionChannelTypeResponse) =>
        item.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: CollectionChannelTypeResponse) => (
        <span className="inline-flex items-center gap-1">
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
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Sin acción
            </span>
          )}
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
        title="Tipos de canal"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando tipos de canal..."
        emptyMessage={error ? 'No fue posible cargar los tipos de canal.' : 'No hay tipos de canal registrados.'}
        maxHeightClassName="max-h-[640px]"
      />
    </div>
  )
}
