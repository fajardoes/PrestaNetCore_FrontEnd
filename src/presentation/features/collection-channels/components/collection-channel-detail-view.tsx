import { useState, type ReactNode } from 'react'
import { Activity, ArrowLeft, Pencil, ShieldAlert, UserPlus, Users } from 'lucide-react'
import type { CollectionChannelExposureResponse } from '@/infrastructure/collection-channels/responses/collection-channel-exposure-response'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/collection-channel-user-response'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import {
  formatChannelDateTime,
  formatChannelMoney,
  formatUtilization,
  getChannelStatusBadgeClass,
  getExposureBadgeClass,
  getExposureBarClass,
  getExposureSummary,
  resolveUserOutstandingUtilization,
  toChannelTypeLabel,
} from './collection-channel-ui'

interface CollectionChannelDetailViewProps {
  channel: CollectionChannelResponse
  exposure: CollectionChannelExposureResponse | null
  isExposureLoading: boolean
  exposureError: string | null
  channelTypes: CollectionChannelTypeResponse[]
  canUpdate: boolean
  canManageUsers: boolean
  removingUserId: string | null
  updatingUserLimitId: string | null
  removeError?: string | null
  updateUserLimitError?: string | null
  onBack: () => void
  onEdit: (channel: CollectionChannelResponse) => void
  onAssignUser: (channel: CollectionChannelResponse) => void
  onEditUserLimit: (user: CollectionChannelUserResponse) => void
  onRemoveUser: (channel: CollectionChannelResponse, userId: string) => void
}

export const CollectionChannelDetailView = ({
  channel,
  exposure,
  isExposureLoading,
  exposureError,
  channelTypes,
  canUpdate,
  canManageUsers,
  removingUserId,
  updatingUserLimitId,
  removeError,
  updateUserLimitError,
  onBack,
  onEdit,
  onAssignUser,
  onEditUserLimit,
  onRemoveUser,
}: CollectionChannelDetailViewProps) => {
  const [pendingUserRemoval, setPendingUserRemoval] = useState<{
    userId: string
    userLabel: string
  } | null>(null)

  const summary = getExposureSummary(exposure, channel)
  const utilizationPercentage = summary?.utilizationPercentage ?? 0
  const progressWidth = `${Math.min(100, Math.max(0, utilizationPercentage))}%`
  const channelTypeLabel = channel.channelTypeName?.trim()
    ? channel.channelTypeName
    : toChannelTypeLabel(channel.channelTypeCode, channelTypes)

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a canales
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {channel.name}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getChannelStatusBadgeClass(channel.isActive)}`}
                >
                  {channel.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                  {channel.code}
                </span>
              </div>

              <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
                Vista completa del canal operativo, sus límites pendientes y los usuarios habilitados para operar en recaudación.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canUpdate ? (
                <button
                  type="button"
                  className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!channel.isActive}
                  onClick={() => onEdit(channel)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar canal
                </button>
              ) : null}
              {canManageUsers ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!channel.isActive}
                  onClick={() => onAssignUser(channel)}
                >
                  <UserPlus className="h-4 w-4" />
                  Asignar usuario
                </button>
              ) : null}
            </div>
          </div>
        </section>

        {!channel.isActive ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100">
            El canal está inactivo. Las acciones operativas quedan bloqueadas y las asignaciones activas asociadas dependen del backend.
          </div>
        ) : null}

        {channel.isLimitExceeded ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-100">
            El canal se encuentra excedido respecto al límite máximo de saldo pendiente configurado. La alerta es visual; el control operativo final sigue viniendo del backend.
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DetailCard title="Datos generales">
            <DetailItem label="Código" value={channel.code} />
            <DetailItem
              label="Tipo de canal"
              value={channelTypeLabel}
            />
            <DetailItem label="Moneda" value={channel.currencyCode} />
            <DetailItem label="Creado" value={formatChannelDateTime(channel.createdAt)} />
            <DetailItem label="Actualizado" value={formatChannelDateTime(channel.updatedAt)} />
            <DetailItem label="Notas" value={channel.notes?.trim() || 'Sin notas registradas'} />
          </DetailCard>

          <DetailCard title="Límites operativos">
            <DetailItem
              label="Límite por pago"
              value={formatChannelMoney(channel.maxSinglePaymentAmount, channel.currencyCode)}
            />
            <DetailItem
              label="Límite diario"
              value={formatChannelMoney(channel.maxDailyAmount, channel.currencyCode)}
            />
            <DetailItem
              label="Límite máximo de saldo pendiente"
              value={formatChannelMoney(channel.maxOutstandingAmount, channel.currencyCode)}
            />
          </DetailCard>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                <Activity className="h-4.5 w-4.5" />
                Saldo pendiente del canal
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Seguimiento del saldo pendiente por liquidar y del consumo del límite máximo configurado para el canal.
              </p>
            </div>
            {summary ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getExposureBadgeClass(
                  summary.utilizationPercentage,
                  summary.isLimitExceeded,
                )}`}
              >
                {summary.isLimitExceeded ? 'Excedido' : formatUtilization(summary.utilizationPercentage)}
              </span>
            ) : null}
          </div>

          {isExposureLoading ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Consultando saldo pendiente...
            </p>
          ) : exposureError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {exposureError}
            </div>
          ) : summary ? (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Saldo pendiente"
                  value={formatChannelMoney(summary.currentOutstandingAmount, summary.currencyCode)}
                />
                <MetricCard
                  label="Saldo disponible del límite"
                  value={formatChannelMoney(summary.availableOutstandingAmount, summary.currencyCode)}
                />
                <MetricCard
                  label="Límite máximo de saldo pendiente"
                  value={formatChannelMoney(summary.maxOutstandingAmount, summary.currencyCode)}
                />
                <MetricCard label="Usuarios activos" value={String(summary.activeUsersCount)} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Uso del límite
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {formatUtilization(summary.utilizationPercentage)}
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${getExposureBarClass(
                      summary.utilizationPercentage,
                      summary.isLimitExceeded,
                    )}`}
                    style={{ width: progressWidth }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Indicador informativo. La validación y el bloqueo definitivo deben seguir viniendo del backend.
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                <Users className="h-4.5 w-4.5" />
                Usuarios asignados
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Solo deben asignarse usuarios con permiso operativo `collection_channels.operate`.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
              {channel.activeUsersCount} activos
            </span>
          </div>

          {removeError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {removeError}
            </div>
          ) : null}

          {updateUserLimitError ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {updateUserLimitError}
            </div>
          ) : null}

          {!channel.users.length ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              No hay usuarios asignados actualmente. Puedes agregar usuarios habilitados para iniciar la operación del canal.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    {[
                      'Usuario',
                      'Límite máximo permitido',
                      'Saldo pendiente',
                      'Disponible',
                      'Estado de límite',
                      'Asignado',
                      'Acciones',
                    ].map((label) => (
                      <th
                        key={label}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {channel.users.map((user) => (
                    <tr
                      key={user.id}
                      className={
                        !user.isActive || user.isLimitExceeded
                          ? 'bg-red-50 dark:bg-red-500/10'
                          : ''
                      }
                    >
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        <div className="space-y-1">
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {user.userName}
                          </p>
                          <p>{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {formatChannelMoney(user.maxOutstandingAmount, channel.currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {formatChannelMoney(user.currentOutstandingAmount, channel.currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {formatChannelMoney(user.availableOutstandingAmount, channel.currencyCode)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                              user.isActive
                                ? getExposureBadgeClass(
                                    resolveUserOutstandingUtilization(user),
                                    user.isLimitExceeded,
                                  )
                                : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                            }`}
                          >
                            {!user.isActive
                              ? 'Inactivo'
                              : user.isLimitExceeded
                                ? 'Excedido'
                                : user.currentOutstandingAmount > 0
                                  ? 'Con saldo pendiente'
                                  : 'Disponible'}
                          </span>
                          {user.isLimitExceeded ? (
                            <p className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Límite excedido
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                        {formatChannelDateTime(user.assignedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {canManageUsers ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-table-action disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={!channel.isActive || !user.isActive || updatingUserLimitId === user.userId}
                              onClick={() => onEditUserLimit(user)}
                            >
                              {updatingUserLimitId === user.userId ? 'Guardando...' : 'Editar límite'}
                            </button>
                            <button
                              type="button"
                              className="btn-table-action disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={
                                !channel.isActive ||
                                !user.isActive ||
                                removingUserId === user.userId ||
                                user.currentOutstandingAmount > 0
                              }
                              title={
                                user.currentOutstandingAmount > 0
                                  ? 'No se puede remover mientras exista saldo pendiente.'
                                  : 'Remover usuario'
                              }
                              onClick={() =>
                                setPendingUserRemoval({
                                  userId: user.userId,
                                  userLabel: user.email,
                                })
                              }
                            >
                              {removingUserId === user.userId ? 'Removiendo...' : 'Remover'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Sin acción
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={Boolean(pendingUserRemoval)}
        title="¿Deseas remover este usuario del canal?"
        description={
          pendingUserRemoval
            ? `Se removerá la asignación activa de ${pendingUserRemoval.userLabel}.`
            : ''
        }
        confirmLabel="Remover usuario"
        isProcessing={Boolean(removingUserId)}
        onCancel={() => setPendingUserRemoval(null)}
        onConfirm={() => {
          if (!pendingUserRemoval) return
          onRemoveUser(channel, pendingUserRemoval.userId)
          setPendingUserRemoval(null)
        }}
      />
    </>
  )
}

const DetailCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
    <div className="mt-4 grid grid-cols-1 gap-3">{children}</div>
  </section>
)

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-1 text-sm text-slate-800 dark:text-slate-100">{value}</div>
  </div>
)

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">{value}</p>
  </div>
)
