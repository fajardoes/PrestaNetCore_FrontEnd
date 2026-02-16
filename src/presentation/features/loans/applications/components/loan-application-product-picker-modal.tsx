import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationProductPickerModalProps {
  open: boolean
  products: LoanProductListItemDto[]
  search: string
  isLoading: boolean
  error: string | null
  selectedProductId?: string
  onSearchChange: (value: string) => void
  onSelect: (product: LoanProductListItemDto) => void
  onClose: () => void
}

export const LoanApplicationProductPickerModal = ({
  open,
  products,
  search,
  isLoading,
  error,
  selectedProductId,
  onSearchChange,
  onSelect,
  onClose,
}: LoanApplicationProductPickerModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Seleccionar producto
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Busca por codigo o nombre y selecciona un producto activo.
            </p>
          </div>
          <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
          <ListFiltersBar
            search={search}
            onSearchChange={onSearchChange}
            placeholder="Buscar por codigo o nombre..."
            status="active"
            onStatusChange={() => undefined}
            showStatus={false}
          />

          <TableContainer mode="legacy-compact" variant="strong" className="h-full">
            <div className="max-h-[58vh] overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left">Accion</th>
                    <th className="text-left">Codigo</th>
                    <th className="text-left">Producto</th>
                    <th className="text-left">Moneda</th>
                    <th className="text-right">Monto</th>
                    <th className="text-right">Plazo</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        Cargando productos...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                        {error}
                      </td>
                    </tr>
                  ) : !products.length ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron productos con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const isSelected = selectedProductId === product.id
                      return (
                        <tr key={product.id} className={isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}>
                          <td>
                            <button
                              type="button"
                              className="btn-table-action border border-primary/40 bg-primary/10 text-primary-700 hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary-200 dark:hover:bg-primary/30"
                              onClick={() => onSelect(product)}
                            >
                              {isSelected ? 'Seleccionado' : 'Seleccionar'}
                            </button>
                          </td>
                          <td className="font-semibold">{product.code}</td>
                          <td className="text-slate-800 dark:text-slate-100">{product.name}</td>
                          <td>{product.currencyCode || '—'}</td>
                          <td className="text-right">
                            {formatMoney(product.minAmount)} - {formatMoney(product.maxAmount)}
                          </td>
                          <td className="text-right">
                            {product.minTerm} - {product.maxTerm} {product.termUnit}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </TableContainer>
        </div>
      </div>
    </div>
  )
}
