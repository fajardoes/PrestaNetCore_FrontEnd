import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

interface ClientsTableProps {
  clients: ClientListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSelect: (client: ClientListItem) => void
  onToggle: (client: ClientListItem) => void
  onDelete: (client: ClientListItem) => void
  processingId?: string | null
  municipalityNameById?: Record<string, string>
}

export const ClientsTable = ({
  clients,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onSelect,
  onToggle,
  onDelete,
  processingId,
  municipalityNameById,
}: ClientsTableProps) => {
  const getMunicipalityName = (client: ClientListItem) =>
    client.municipioNombre ??
    (client.municipioId
      ? municipalityNameById?.[client.municipioId] ?? '—'
      : '—')

  const columns = [
    {
      key: 'client',
      header: 'Cliente',
      className: 'min-w-[240px]',
      render: (client: ClientListItem) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {client.nombreCompleto}
        </span>
      ),
      getTitle: (client: ClientListItem) => client.nombreCompleto,
    },
    {
      key: 'identity',
      header: 'Identidad',
      className: 'min-w-[135px]',
      render: (client: ClientListItem) => (
        <HnIdentityText value={client.identidad} />
      ),
    },
    {
      key: 'municipality',
      header: 'Municipio',
      className: 'min-w-[150px]',
      render: (client: ClientListItem) => getMunicipalityName(client),
      getTitle: (client: ClientListItem) => getMunicipalityName(client),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (client: ClientListItem) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            client.activo
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {client.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (client: ClientListItem) =>
        client.activo ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[270px]',
      render: (client: ClientListItem) => (
        <span className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onSelect(client)}
            className="btn-table-action"
            disabled={processingId === client.id}
          >
            Ver / Editar
          </button>
          <button
            type="button"
            onClick={() => onToggle(client)}
            className="btn-table-action"
            disabled={processingId === client.id}
          >
            {client.activo ? 'Desactivar' : 'Activar'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(client)}
            className="btn-table-action text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
            disabled={processingId === client.id}
          >
            Borrar
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
        title="Listado de clientes"
        columns={columns}
        rows={clients}
        rowKey={(client) => client.id}
        isLoading={isLoading}
        loadingMessage="Cargando clientes..."
        emptyMessage={error ? 'No fue posible cargar los clientes.' : 'No hay clientes registrados.'}
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
