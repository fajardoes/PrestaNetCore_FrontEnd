import { Activity, Eye, Pencil, ShieldAlert, UserRoundCog } from 'lucide-react'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
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
  return (
    <TableContainer mode="legacy-compact" variant="strong">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {[
                'Código',
                'Nombre',
                'Tipo',
                'Moneda',
                'Estado',
                'Límite por pago',
                'Límite diario',
                'Saldo pendiente',
                'Saldo disponible del límite',
                'Utilización',
                'Usuarios',
              ].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  {label}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Cargando canales de recaudación...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-300">
                  {error}
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No hay canales registrados para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const utilization = resolveChannelUtilization(item)
                const hasPendingOutstanding =
                  item.currentOutstandingAmount > 0 ||
                  item.users.some((user) => user.currentOutstandingAmount > 0)
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-900 ${
                      item.isLimitExceeded ? 'bg-red-50/80 dark:bg-red-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                        {item.notes ? (
                          <p className="max-w-xs truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {toChannelTypeLabel(item.channelTypeCode, channelTypes)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {item.currencyCode}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getChannelStatusBadgeClass(item.isActive)}`}
                      >
                        {item.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {formatChannelMoney(item.maxSinglePaymentAmount, item.currencyCode)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {formatChannelMoney(item.maxDailyAmount, item.currencyCode)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {formatChannelMoney(item.currentOutstandingAmount, item.currencyCode)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {formatChannelMoney(item.availableOutstandingAmount, item.currencyCode)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getExposureBadgeClass(utilization, item.isLimitExceeded)}`}
                        >
                          {item.isLimitExceeded ? 'Excedido' : formatUtilization(utilization)}
                        </span>
                        {item.isLimitExceeded ? (
                          <p className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Riesgo operativo
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      {item.activeUsersCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
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
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </TableContainer>
  )
}
