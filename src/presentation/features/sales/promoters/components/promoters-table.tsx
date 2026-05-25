import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

interface PromotersTableProps {
  promoters: PromoterResponse[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (promoter: PromoterResponse) => void
  onToggle: (promoter: PromoterResponse) => void
  processingId?: string | null
}

export const PromotersTable = ({
  promoters,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onToggle,
  processingId,
}: PromotersTableProps) => {
  const columns = [
    {
      key: 'client',
      header: 'Cliente',
      className: 'min-w-[240px]',
      render: (promoter: PromoterResponse) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {promoter.clientFullName ?? 'Sin nombre'}
        </span>
      ),
      getTitle: (promoter: PromoterResponse) =>
        promoter.clientFullName ?? 'Sin nombre',
    },
    {
      key: 'identity',
      header: 'Identidad',
      className: 'min-w-[135px]',
      render: (promoter: PromoterResponse) => (
        <HnIdentityText value={promoter.clientIdentityNo} fallback="--" />
      ),
    },
    {
      key: 'agency',
      header: 'Agencia',
      className: 'min-w-[180px]',
      render: (promoter: PromoterResponse) => promoter.agencyName ?? '--',
      getTitle: (promoter: PromoterResponse) => promoter.agencyName ?? '--',
    },
    {
      key: 'code',
      header: 'Codigo',
      className: 'min-w-[100px]',
      render: (promoter: PromoterResponse) => promoter.code ?? '--',
      getTitle: (promoter: PromoterResponse) => promoter.code ?? '--',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (promoter: PromoterResponse) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            promoter.isActive
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {promoter.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (promoter: PromoterResponse) =>
        promoter.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[170px]',
      render: (promoter: PromoterResponse) => (
        <span className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(promoter)}
            className="btn-table-action"
            disabled={processingId === promoter.id}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggle(promoter)}
            className="btn-table-action"
            disabled={processingId === promoter.id}
          >
            {promoter.isActive ? 'Desactivar' : 'Activar'}
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
        title="Listado de promotores"
        columns={columns}
        rows={promoters}
        rowKey={(promoter) => promoter.id}
        isLoading={isLoading}
        loadingMessage="Cargando promotores..."
        emptyMessage={error ? 'No fue posible cargar los promotores.' : 'No hay promotores registrados.'}
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
