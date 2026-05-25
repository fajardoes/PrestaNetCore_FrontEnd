import { Activity, Eye, Pencil, ShieldAlert, UserRoundCog } from 'lucide-react'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import {
  formatChannelMoney,
  formatUtilization,
  getChannelStatusBadgeClass,
  getExposureBadgeClass,
  resolveChannelUtilization,
  toChannelTypeLabel,
} from './collection-channel-ui'

interface CollectionChannelsTableProps {
  items: CollectionChannelResponse[]
  isLoading: boolean
  error: string | null
  page: number
  pageSize: number
  totalPages: number
  channelTypes: CollectionChannelTypeResponse[]
  onPageChange: (page: number) => void
  canUpdate: boolean
  canManageUsers: boolean
  onView: (channel: CollectionChannelResponse) => void
  onEdit: (channel: CollectionChannelResponse) => void
  onDeactivate: (channel: CollectionChannelResponse) => void
  onManageUsers: (channel: CollectionChannelResponse) => void
}

export const CollectionChannelsTable = ({
  items,
  isLoading,
  error,
  page,
  pageSize,
  totalPages,
  channelTypes,
  onPageChange,
  canUpdate,
  canManageUsers,
  onView,
  onEdit,
  onDeactivate,
  onManageUsers,
}: CollectionChannelsTableProps) => {
  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelResponse) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {item.code}
        </span>
      ),
      getTitle: (item: CollectionChannelResponse) => item.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'w-[225px]',
      render: (item: CollectionChannelResponse) => (
        <span className="flex w-[205px] flex-col gap-1 whitespace-normal">
          <span className="font-medium text-slate-800 dark:text-slate-100">
            {item.name}
          </span>
          {item.notes ? (
            <span className="break-words text-xs text-slate-500 dark:text-slate-400">
              {item.notes}
            </span>
          ) : null}
        </span>
      ),
      getTitle: (item: CollectionChannelResponse) =>
        item.notes ? `${item.name} - ${item.notes}` : item.name,
    },
    {
      key: 'type',
      header: 'Tipo',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelResponse) =>
        toChannelTypeLabel(item.channelTypeCode, channelTypes),
      getTitle: (item: CollectionChannelResponse) =>
        toChannelTypeLabel(item.channelTypeCode, channelTypes),
    },
    {
      key: 'currency',
      header: 'Moneda',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelResponse) => item.currencyCode,
      getTitle: (item: CollectionChannelResponse) => item.currencyCode,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelResponse) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getChannelStatusBadgeClass(item.isActive)}`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (item: CollectionChannelResponse) =>
        item.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'singleLimit',
      header: 'Límite por pago',
      className: 'whitespace-nowrap text-right',
      render: (item: CollectionChannelResponse) =>
        formatChannelMoney(item.maxSinglePaymentAmount, item.currencyCode),
    },
    {
      key: 'dailyLimit',
      header: 'Límite diario',
      className: 'whitespace-nowrap text-right',
      render: (item: CollectionChannelResponse) =>
        formatChannelMoney(item.maxDailyAmount, item.currencyCode),
    },
    {
      key: 'outstanding',
      header: 'Saldo pendiente',
      className: 'whitespace-nowrap text-right',
      render: (item: CollectionChannelResponse) =>
        formatChannelMoney(item.currentOutstandingAmount, item.currencyCode),
    },
    {
      key: 'available',
      header: 'Saldo disponible del límite',
      className: 'whitespace-nowrap text-right',
      render: (item: CollectionChannelResponse) =>
        formatChannelMoney(item.availableOutstandingAmount, item.currencyCode),
    },
    {
      key: 'utilization',
      header: 'Utilización',
      className: 'whitespace-nowrap',
      render: (item: CollectionChannelResponse) => {
        const utilization = resolveChannelUtilization(item)

        return (
          <span className="flex flex-col gap-2">
            <span
              className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getExposureBadgeClass(utilization, item.isLimitExceeded)}`}
            >
              {item.isLimitExceeded ? 'Excedido' : formatUtilization(utilization)}
            </span>
            {item.isLimitExceeded ? (
              <span className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                <ShieldAlert className="h-3.5 w-3.5" />
                Riesgo operativo
              </span>
            ) : null}
          </span>
        )
      },
    },
    {
      key: 'users',
      header: 'Usuarios',
      className: 'whitespace-nowrap text-right',
      render: (item: CollectionChannelResponse) => item.activeUsersCount,
      getTitle: (item: CollectionChannelResponse) => String(item.activeUsersCount),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (item: CollectionChannelResponse) => {
        const hasPendingOutstanding =
          item.currentOutstandingAmount > 0 ||
          item.users.some((user) => user.currentOutstandingAmount > 0)

        return (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              className="btn-table-action w-7 px-0"
              title="Ver detalle"
              onClick={() => onView(item)}
            >
              <Eye className="mx-auto h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="btn-table-action w-7 px-0"
              title="Ver saldo pendiente"
              onClick={() => onView(item)}
            >
              <Activity className="mx-auto h-3.5 w-3.5" />
            </button>
            {canManageUsers ? (
              <button
                type="button"
                className="btn-table-action w-7 px-0"
                title="Administrar usuarios"
                onClick={() => onManageUsers(item)}
              >
                <UserRoundCog className="mx-auto h-3.5 w-3.5" />
              </button>
            ) : null}
            {canUpdate ? (
              <>
                <button
                  type="button"
                  className="btn-table-action w-7 px-0 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Editar canal"
                  disabled={!item.isActive}
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="mx-auto h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="btn-table-action w-7 px-0 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Desactivar canal"
                  disabled={!item.isActive || hasPendingOutstanding}
                  onClick={() => onDeactivate(item)}
                >
                  <ShieldAlert className="mx-auto h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </span>
        )
      },
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
        title="Canales de recaudación"
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando canales de recaudación..."
        emptyMessage={error ? 'No fue posible cargar los canales de recaudación.' : 'No hay canales registrados para los filtros seleccionados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * pageSize + 1}
        fitContent
        getRowClassName={(item) =>
          item.isLimitExceeded ? 'bg-red-50/80 dark:bg-red-500/5' : ''
        }
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
