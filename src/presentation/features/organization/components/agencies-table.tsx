import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

interface AgenciesTableProps {
  agencies: Agency[]
  isLoading: boolean
  error: string | null
  onEdit: (agency: Agency) => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const AgenciesTable = ({
  agencies,
  isLoading,
  error,
  onEdit,
  page,
  totalPages,
  onPageChange,
}: AgenciesTableProps) => {
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'min-w-[110px]',
      render: (agency: Agency) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {agency.code}
        </span>
      ),
      getTitle: (agency: Agency) => agency.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[220px]',
      render: (agency: Agency) => agency.name,
      getTitle: (agency: Agency) => agency.name,
    },
    {
      key: 'slug',
      header: 'Slug',
      className: 'min-w-[180px]',
      render: (agency: Agency) => agency.slug,
      getTitle: (agency: Agency) => agency.slug,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (agency: Agency) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            agency.isActive
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {agency.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
      getTitle: (agency: Agency) => (agency.isActive ? 'Activa' : 'Inactiva'),
    },
    {
      key: 'origination',
      header: 'Originación',
      className: 'min-w-[130px]',
      render: (agency: Agency) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            agency.canCreateLoanApplications
              ? 'bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-100 dark:ring-blue-500/40'
              : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
          }`}
        >
          {agency.canCreateLoanApplications ? 'Habilitada' : 'No habilitada'}
        </span>
      ),
      getTitle: (agency: Agency) =>
        agency.canCreateLoanApplications ? 'Habilitada' : 'No habilitada',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[90px]',
      render: (agency: Agency) => (
        <span className="flex justify-end">
          <button
            type="button"
            onClick={() => onEdit(agency)}
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
        title="Listado de agencias"
        columns={columns}
        rows={agencies}
        rowKey={(agency) => agency.id}
        isLoading={isLoading}
        loadingMessage="Cargando agencias..."
        emptyMessage={error ? 'No fue posible cargar las agencias.' : 'No hay agencias registradas.'}
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
