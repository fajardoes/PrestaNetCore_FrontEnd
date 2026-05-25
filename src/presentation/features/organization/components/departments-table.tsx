import type { Department } from '@/infrastructure/interfaces/organization/geography'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

interface DepartmentsTableProps {
  departments: Department[]
  isLoading: boolean
  error: string | null
  onEdit: (department: Department) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const DepartmentsTable = ({
  departments,
  isLoading,
  error,
  onEdit,
  page,
  totalPages,
  onPageChange,
}: DepartmentsTableProps) => {
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'min-w-[110px]',
      render: (department: Department) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {department.code}
        </span>
      ),
      getTitle: (department: Department) => department.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[220px]',
      render: (department: Department) => department.name,
      getTitle: (department: Department) => department.name,
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'min-w-[180px]',
      render: (department: Department) => department.slug,
      getTitle: (department: Department) => department.slug,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (department: Department) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            department.activo
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {department.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (department: Department) =>
        department.activo ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[90px]',
      render: (department: Department) => (
        <span className="flex justify-end">
          <button
            type="button"
            onClick={() => onEdit(department)}
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
        title="Listado de departamentos"
        columns={columns}
        rows={departments}
        rowKey={(department) => department.id}
        isLoading={isLoading}
        loadingMessage="Cargando departamentos..."
        emptyMessage={error ? 'No fue posible cargar los departamentos.' : 'No hay departamentos registrados.'}
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
