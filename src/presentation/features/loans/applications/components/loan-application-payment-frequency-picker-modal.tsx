import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LoanApplicationPaymentFrequencyPickerModalProps {
  open: boolean
  frequencies: LoanCatalogItemDto[]
  search: string
  isLoading: boolean
  error: string | null
  selectedFrequencyId?: string
  onSearchChange: (value: string) => void
  onSelect: (frequency: LoanCatalogItemDto) => void
  onClose: () => void
}

export const LoanApplicationPaymentFrequencyPickerModal = ({
  open,
  frequencies,
  search,
  isLoading,
  error,
  selectedFrequencyId,
  onSearchChange,
  onSelect,
  onClose,
}: LoanApplicationPaymentFrequencyPickerModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Seleccionar frecuencia de pago
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selecciona la frecuencia solicitada para esta solicitud.
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
            placeholder="Buscar por código o nombre..."
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
                    <th className="text-left">Frecuencia</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        Cargando frecuencias...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={3} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                        {error}
                      </td>
                    </tr>
                  ) : !frequencies.length ? (
                    <tr>
                      <td colSpan={3} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron frecuencias con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    frequencies.map((frequency) => {
                      const isSelected = selectedFrequencyId === frequency.id
                      return (
                        <tr key={frequency.id} className={isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}>
                          <td>
                            <button
                              type="button"
                              className="btn-table-action border border-primary/40 bg-primary/10 text-primary-700 hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary-200 dark:hover:bg-primary/30"
                              onClick={() => onSelect(frequency)}
                            >
                              {isSelected ? 'Seleccionado' : 'Seleccionar'}
                            </button>
                          </td>
                          <td className="font-semibold">{frequency.code}</td>
                          <td className="text-slate-800 dark:text-slate-100">{frequency.name}</td>
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
