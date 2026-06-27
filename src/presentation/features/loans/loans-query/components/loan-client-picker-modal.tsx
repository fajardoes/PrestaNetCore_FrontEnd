import type { LoanClientSearchItemResponse } from '@/infrastructure/loans/responses/loan-client-search-response'
import { formatDate } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const CLIENTS_PAGE_SIZE = 10

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

  const columns = [
    {
      key: 'action',
      header: 'Acción',
      className: 'min-w-[115px]',
      render: (client: LoanClientSearchItemResponse) => {
        const isSelected = client.id === selectedClientId

        return (
          <button
            type="button"
            className="btn-table-action border border-primary/40 bg-primary/10 text-primary-700 hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary-200 dark:hover:bg-primary/30"
            onClick={() => onSelect(client)}
          >
            {isSelected ? 'Seleccionado' : 'Seleccionar'}
          </button>
        )
      },
    },
    {
      key: 'client',
      header: 'Cliente',
      className: 'min-w-[240px]',
      render: (client: LoanClientSearchItemResponse) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {client.clientFullName}
        </span>
      ),
      getTitle: (client: LoanClientSearchItemResponse) => client.clientFullName,
    },
    {
      key: 'identity',
      header: 'Identidad',
      className: 'min-w-[135px]',
      render: (client: LoanClientSearchItemResponse) => (
        <HnIdentityText value={client.clientIdentityNo} />
      ),
    },
    {
      key: 'activeLoans',
      header: 'Préstamos activos',
      className: 'min-w-[125px] text-right',
      render: (client: LoanClientSearchItemResponse) => client.activeLoansCount,
      getTitle: (client: LoanClientSearchItemResponse) => String(client.activeLoansCount),
    },
    {
      key: 'totalLoans',
      header: 'Total préstamos',
      className: 'min-w-[115px] text-right',
      render: (client: LoanClientSearchItemResponse) => client.totalLoansCount,
      getTitle: (client: LoanClientSearchItemResponse) => String(client.totalLoansCount),
    },
    {
      key: 'nextDueDate',
      header: 'Próximo vencimiento',
      className: 'min-w-[145px]',
      render: (client: LoanClientSearchItemResponse) => formatDate(client.nextDueDate),
      getTitle: (client: LoanClientSearchItemResponse) => formatDate(client.nextDueDate),
    },
  ]

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

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
              {error}
            </div>
          ) : null}

          <TableTabular
            title="Clientes con préstamos"
            columns={columns}
            rows={clients}
            rowKey={(client) => client.id}
            isLoading={isLoading}
            loadingMessage="Cargando clientes..."
            emptyMessage={error ? 'No fue posible cargar los clientes.' : 'No se encontraron clientes con préstamos.'}
            maxHeightClassName="max-h-[52vh]"
            rowNumberStart={(page - 1) * CLIENTS_PAGE_SIZE + 1}
            getRowClassName={(client) =>
              client.id === selectedClientId ? 'bg-primary/5 dark:bg-primary/10' : ''
            }
          />

          <div>
            <TablePagination
              page={page}
              totalPages={Math.max(1, totalPages)}
              onPageChange={(nextPage) => onPageChange(Math.max(1, nextPage))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
