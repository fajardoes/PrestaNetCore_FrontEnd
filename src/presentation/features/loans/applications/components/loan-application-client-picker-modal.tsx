import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface LoanApplicationClientPickerModalProps {
  open: boolean
  clients: ClientListItem[]
  search: string
  page: number
  totalPages: number
  isLoading: boolean
  error: string | null
  selectedClientId?: string
  municipalityNameById?: Record<string, string>
  onSearchChange: (value: string) => void
  onPageChange: (page: number) => void
  onSelect: (client: ClientListItem) => void
  onClose: () => void
}

export const LoanApplicationClientPickerModal = ({
  open,
  clients,
  search,
  page,
  totalPages,
  isLoading,
  error,
  selectedClientId,
  municipalityNameById,
  onSearchChange,
  onPageChange,
  onSelect,
  onClose,
}: LoanApplicationClientPickerModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Seleccionar cliente
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Busca por nombre o identidad y selecciona un cliente activo.
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
            status="active"
            onStatusChange={() => undefined}
            showStatus={false}
          />

          <TableContainer mode="legacy-compact" variant="strong" className="h-full">
            <div className="max-h-[52vh] overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left">Accion</th>
                    <th className="text-left">Cliente</th>
                    <th className="text-left">Identidad</th>
                    <th className="text-left">Municipio</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                        {error}
                      </td>
                    </tr>
                  ) : !clients.length ? (
                    <tr>
                      <td colSpan={4} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron clientes con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) => {
                      const isSelected = selectedClientId === client.id
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
                            {client.nombreCompleto}
                          </td>
                          <td>
                            <HnIdentityText value={client.identidad} />
                          </td>
                          <td>
                            {client.municipioNombre ||
                              (client.municipioId
                                ? municipalityNameById?.[client.municipioId] ?? '—'
                                : '—')}
                          </td>
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
