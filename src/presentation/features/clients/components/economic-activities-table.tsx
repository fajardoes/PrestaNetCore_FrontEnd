import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

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
  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[200px]',
      render: (activity: EconomicActivityCatalog) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {activity.nombre}
        </span>
      ),
      getTitle: (activity: EconomicActivityCatalog) => activity.nombre,
    },
    {
      key: 'sector',
      header: 'Sector',
      className: 'min-w-[160px]',
      render: (activity: EconomicActivityCatalog) =>
        activity.sectorNombre ?? '—',
      getTitle: (activity: EconomicActivityCatalog) =>
        activity.sectorNombre ?? '—',
    },
    {
      key: 'description',
      header: 'Descripción',
      className: 'min-w-[230px]',
      render: (activity: EconomicActivityCatalog) =>
        activity.descripcion ?? '—',
      getTitle: (activity: EconomicActivityCatalog) =>
        activity.descripcion ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (activity: EconomicActivityCatalog) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            activity.activo
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {activity.activo ? 'Activa' : 'Inactiva'}
        </span>
      ),
      getTitle: (activity: EconomicActivityCatalog) =>
        activity.activo ? 'Activa' : 'Inactiva',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[250px]',
      render: (activity: EconomicActivityCatalog) => (
        <span className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onToggle(activity)}
            className="btn-table-action"
          >
            {activity.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button
            type="button"
            onClick={() => onEdit(activity)}
            className="btn-table-action"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(activity)}
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
        title="Listado de actividades económicas"
        columns={columns}
        rows={items}
        rowKey={(activity) => activity.id}
        isLoading={isLoading}
        loadingMessage="Cargando actividades..."
        emptyMessage={error ? 'No fue posible cargar las actividades económicas.' : 'No hay actividades económicas registradas.'}
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
