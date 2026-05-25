import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import { AccountingStatusBadge } from '@/presentation/features/accounting/components/accounting-status-badge'
import { TableTabular } from '@/presentation/share/components/table-tabular'

interface LoanProductsTableProps {
  items: LoanProductListItemDto[]
  isLoading: boolean
  error: string | null
  onEdit: (item: LoanProductListItemDto) => void
  onViewDetail: (item: LoanProductListItemDto) => void
  onToggleStatus: (item: LoanProductListItemDto) => void
  isProcessingId?: string | null
}

export const LoanProductsTable = ({
  items,
  isLoading,
  error,
  onEdit,
  onViewDetail,
  onToggleStatus,
  isProcessingId,
}: LoanProductsTableProps) => {
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'min-w-[110px]',
      render: (item: LoanProductListItemDto) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {item.code}
        </span>
      ),
      getTitle: (item: LoanProductListItemDto) => item.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[220px]',
      render: (item: LoanProductListItemDto) => item.name,
      getTitle: (item: LoanProductListItemDto) => item.name,
    },
    {
      key: 'currency',
      header: 'Moneda',
      className: 'min-w-[90px]',
      render: (item: LoanProductListItemDto) => item.currencyCode,
      getTitle: (item: LoanProductListItemDto) => item.currencyCode,
    },
    {
      key: 'amount',
      header: 'Monto',
      className: 'min-w-[150px]',
      render: (item: LoanProductListItemDto) =>
        `${item.minAmount} - ${item.maxAmount}`,
      getTitle: (item: LoanProductListItemDto) =>
        `${item.minAmount} - ${item.maxAmount}`,
    },
    {
      key: 'term',
      header: 'Plazo',
      className: 'min-w-[150px]',
      render: (item: LoanProductListItemDto) =>
        `${item.minTerm} - ${item.maxTerm} ${item.termUnit}`,
      getTitle: (item: LoanProductListItemDto) =>
        `${item.minTerm} - ${item.maxTerm} ${item.termUnit}`,
    },
    {
      key: 'portfolioType',
      header: 'Tipo cartera',
      className: 'min-w-[150px]',
      render: (item: LoanProductListItemDto) => item.portfolioType,
      getTitle: (item: LoanProductListItemDto) => item.portfolioType,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item: LoanProductListItemDto) => (
        <AccountingStatusBadge isActive={item.isActive} />
      ),
      getTitle: (item: LoanProductListItemDto) =>
        item.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[230px]',
      render: (item: LoanProductListItemDto) => (
        <span className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="btn-table-action"
            onClick={() => onViewDetail(item)}
          >
            Detalle
          </button>
          <button
            type="button"
            className="btn-table-action"
            onClick={() => onEdit(item)}
          >
            Editar
          </button>
          <button
            type="button"
            className="btn-table-action"
            onClick={() => onToggleStatus(item)}
            disabled={isProcessingId === item.id}
          >
            {item.isActive ? 'Desactivar' : 'Activar'}
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
        title="Listado de productos de préstamo"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando productos..."
        emptyMessage={error ? 'No fue posible cargar los productos.' : 'No hay productos con esos filtros.'}
        maxHeightClassName="max-h-[640px]"
      />
    </div>
  )
}
