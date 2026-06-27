import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

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
  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[180px]',
      render: (catalog: ClientCatalogItem) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {catalog.nombre}
        </span>
      ),
      getTitle: (catalog: ClientCatalogItem) => catalog.nombre,
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'min-w-[170px]',
      render: (catalog: ClientCatalogItem) => catalog.slug,
      getTitle: (catalog: ClientCatalogItem) => catalog.slug,
    },
    {
      key: 'description',
      header: 'Descripción',
      className: 'min-w-[230px]',
      render: (catalog: ClientCatalogItem) => catalog.descripcion ?? '—',
      getTitle: (catalog: ClientCatalogItem) => catalog.descripcion ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (catalog: ClientCatalogItem) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            catalog.activo
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {catalog.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (catalog: ClientCatalogItem) =>
        catalog.activo ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[250px]',
      render: (catalog: ClientCatalogItem) => (
        <span className="flex items-center justify-end gap-2">
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
        title="Listado de catálogos"
        columns={columns}
        rows={items}
        rowKey={(catalog) => catalog.id}
        isLoading={isLoading}
        loadingMessage="Cargando catálogos..."
        emptyMessage={error ? 'No fue posible cargar los catálogos.' : 'No hay registros para este catálogo.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * PAGE_SIZE + 1}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
