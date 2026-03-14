import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import { formatDate } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface LoanClientPickerModalProps {
  open: boolean
  clients: LoanClientSearchItemResponse[]
  search: string
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  selectedClientId?: string
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onSelect: (client: LoanClientSearchItemResponse) => void
  onClose: () => void
}

export const LoanClientPickerModal = ({
  open,
  clients,
  search,
  page,
  totalPages,
  isLoading,
  error,
  selectedClientId,
  onSearchChange,
  onPageChange,
  onSelect,
  onClose,
}: LoanClientPickerModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Seleccionar cliente con préstamos
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Busca por nombre o identidad para consultar la cartera del cliente.
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
            placeholder="Buscar por nombre o identidad..."
            status="all"
            onStatusChange={() => undefined}
            showStatus={false}
          />

          <TableContainer mode="legacy-compact" variant="strong" className="h-full">
            <div className="max-h-[52vh] overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th>Acción</th>
                    <th>Cliente</th>
                    <th>Identidad</th>
                    <th className="text-right">Préstamos activos</th>
                    <th className="text-right">Total préstamos</th>
                    <th>Próximo vencimiento</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                        {error}
                      </td>
                    </tr>
                  ) : !clients.length ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron clientes con préstamos.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => {
                      const isSelected = client.id === selectedClientId
                      return (
                        <tr key={client.id} className={isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}>
                          <td>
                            <button
                              type="button"
                              className="btn-table-action border border-primary/40 bg-primary/10 text-primary-700 hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary-200 dark:hover:bg-primary/30"
                              onClick={() => onSelect(client)}
                            >
                              {isSelected ? 'Seleccionado' : 'Seleccionar'}
                            </button>
                          </td>
                          <td className="font-medium text-slate-800 dark:text-slate-100">
                            {client.clientFullName}
                          </td>
                          <td>
                            <HnIdentityText value={client.clientIdentityNo} />
                          </td>
                          <td className="text-right">{client.activeLoansCount}</td>
                          <td className="text-right">{client.totalLoansCount}</td>
                          <td>{formatDate(client.nextDueDate)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={page}
              totalPages={Math.max(1, totalPages)}
              onPageChange={(nextPage) => onPageChange(Math.max(1, nextPage))}
            />
          </TableContainer>
        </div>
      </div>
    </div>
  )
}
