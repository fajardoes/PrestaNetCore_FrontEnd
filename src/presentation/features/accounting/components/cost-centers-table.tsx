import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const COST_CENTERS_PAGE_SIZE = 10

interface CostCentersTableProps {
  costCenters: CostCenter[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit?: (center: CostCenter) => void
}

export const CostCentersTable = ({
  costCenters,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onEdit,
}: CostCentersTableProps) => {
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'min-w-[115px]',
      render: (center: CostCenter) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {center.code}
        </span>
      ),
      getTitle: (center: CostCenter) => center.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[240px]',
      render: (center: CostCenter) => (
        <span className="flex flex-col">
          <span>{center.name}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {center.slug}
          </span>
        </span>
      ),
      getTitle: (center: CostCenter) => `${center.name} - ${center.slug}`,
    },
    {
      key: 'agency',
      header: 'Agencia',
      className: 'min-w-[165px]',
      render: (center: CostCenter) => center.agencyId,
      getTitle: (center: CostCenter) => center.agencyId,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'min-w-[105px]',
      render: (center: CostCenter) => (
        <AccountingStatusBadge isActive={center.isActive} />
      ),
      getTitle: (center: CostCenter) => center.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[100px]',
      render: (center: CostCenter) => onEdit ? (
        <button
          type="button"
          onClick={() => onEdit(center)}
          className="btn-table-action"
        >
          Editar
        </button>
      ) : (
        <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
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
        title="Centros de costo"
        columns={columns}
        rows={costCenters}
        rowKey={(center) => center.id}
        isLoading={isLoading}
        loadingMessage="Cargando centros de costo..."
        emptyMessage={error ? 'No fue posible cargar los centros de costo.' : 'No hay centros de costo con los filtros aplicados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * COST_CENTERS_PAGE_SIZE + 1}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
