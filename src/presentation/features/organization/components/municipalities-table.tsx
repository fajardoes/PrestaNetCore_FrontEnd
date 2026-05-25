import type { Municipality } from '@/infrastructure/interfaces/organization/geography'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

interface MunicipalitiesTableProps {
  municipalities: Municipality[]
  isLoading: boolean
  error: string | null
  onEdit: (municipality: Municipality) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const MunicipalitiesTable = ({
  municipalities,
  isLoading,
  error,
  onEdit,
  page,
  totalPages,
  onPageChange,
}: MunicipalitiesTableProps) => {
  const columns = [
    {
      key: 'municipality',
      header: 'Municipio',
      className: 'min-w-[220px]',
      render: (municipality: Municipality) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {municipality.name}
        </span>
      ),
      getTitle: (municipality: Municipality) => municipality.name,
    },
    {
      key: 'department',
      header: 'Departamento',
      className: 'min-w-[200px]',
      render: (municipality: Municipality) => municipality.departmentName,
      getTitle: (municipality: Municipality) => municipality.departmentName,
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'min-w-[180px]',
      render: (municipality: Municipality) => municipality.slug,
      getTitle: (municipality: Municipality) => municipality.slug,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (municipality: Municipality) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            municipality.activo
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {municipality.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (municipality: Municipality) =>
        municipality.activo ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[90px]',
      render: (municipality: Municipality) => (
        <span className="flex justify-end">
          <button
            type="button"
            onClick={() => onEdit(municipality)}
            className="btn-table-action"
          >
            Editar
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
        title="Listado de municipios"
        columns={columns}
        rows={municipalities}
        rowKey={(municipality) => municipality.id}
        isLoading={isLoading}
        loadingMessage="Cargando municipios..."
        emptyMessage={error ? 'No fue posible cargar los municipios.' : 'No hay municipios registrados.'}
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
