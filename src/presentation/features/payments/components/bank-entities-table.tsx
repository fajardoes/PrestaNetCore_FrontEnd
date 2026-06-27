import { Pencil, ShieldCheck, ShieldOff } from 'lucide-react'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'
import { TableTabular } from '@/presentation/share/components/table-tabular'

interface BankEntitiesTableProps {
  items: BankEntityResponse[]
  isLoading: boolean
  error: string | null
  canManage: boolean
  onEdit: (item: BankEntityResponse) => void
  onToggleStatus: (item: BankEntityResponse) => void
}

const formatAccountLabel = (item: BankEntityResponse) => {
  if (!item.bankGlAccountCode && !item.bankGlAccountName) return '—'
  return `${item.bankGlAccountCode ?? ''} ${item.bankGlAccountName ?? ''}`.trim()
}

export const BankEntitiesTable = ({
  items,
  isLoading,
  error,
  canManage,
  onEdit,
  onToggleStatus,
}: BankEntitiesTableProps) => {
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'whitespace-nowrap',
      render: (item: BankEntityResponse) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">{item.code}</span>
      ),
      getTitle: (item: BankEntityResponse) => item.code,
    },
    {
      key: 'name',
      header: 'Banco',
      className: 'whitespace-nowrap',
      render: (item: BankEntityResponse) => item.name,
      getTitle: (item: BankEntityResponse) => item.name,
    },
    {
      key: 'description',
      header: 'Descripción',
      className: 'w-[260px]',
      render: (item: BankEntityResponse) => (
        <span className="block w-[240px] whitespace-normal break-words text-slate-700 dark:text-slate-200">
          {item.description?.trim() || '—'}
        </span>
      ),
      getTitle: (item: BankEntityResponse) => item.description?.trim() || '—',
    },
    {
      key: 'account',
      header: 'Cuenta contable',
      className: 'w-[250px]',
      render: (item: BankEntityResponse) => (
        <span className="block w-[230px] whitespace-normal break-words">
          {formatAccountLabel(item)}
        </span>
      ),
      getTitle: (item: BankEntityResponse) => formatAccountLabel(item),
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'whitespace-nowrap',
      render: (item: BankEntityResponse) => (
        <span
          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
            item.isActive
              ? 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100'
          }`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (item: BankEntityResponse) => (item.isActive ? 'Activo' : 'Inactivo'),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: BankEntityResponse) => (
        <span className="inline-flex items-center gap-1">
          {canManage ? (
            <>
              <button
                type="button"
                className="btn-table-action w-7 px-0"
                title="Editar entidad bancaria"
                onClick={() => onEdit(item)}
              >
                <Pencil className="mx-auto h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="btn-table-action w-7 px-0"
                title={item.isActive ? 'Desactivar entidad bancaria' : 'Activar entidad bancaria'}
                onClick={() => onToggleStatus(item)}
              >
                {item.isActive ? (
                  <ShieldOff className="mx-auto h-3.5 w-3.5" />
                ) : (
                  <ShieldCheck className="mx-auto h-3.5 w-3.5" />
                )}
              </button>
            </>
          ) : null}
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
        title="Entidades bancarias"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando entidades bancarias..."
        emptyMessage={
          error ? 'No fue posible cargar las entidades bancarias.' : 'No hay entidades bancarias registradas.'
        }
        maxHeightClassName="max-h-[640px]"
        getRowClassName={(item) => (!item.isActive ? 'bg-red-50/60 dark:bg-red-500/5' : '')}
      />
    </div>
  )
}
