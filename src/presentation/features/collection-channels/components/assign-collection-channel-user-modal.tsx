import { useEffect, useMemo, useState } from 'react'
import type { EligibleCollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/eligible-collection-channel-user-response'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

const PAGE_SIZE = 8

interface AssignCollectionChannelUserModalProps {
  open: boolean
  isLoadingUsers: boolean
  isAssigning: boolean
  error?: string | null
  users: EligibleCollectionChannelUserResponse[]
  loadUsers: (search?: string) => Promise<EligibleCollectionChannelUserResponse[]>
  onClose: () => void
  onSubmit: (userId: string, maxOutstandingAmount: number) => Promise<void> | void
}

export const AssignCollectionChannelUserModal = ({
  open,
  isLoadingUsers,
  isAssigning,
  error,
  users,
  loadUsers,
  onClose,
  onSubmit,
}: AssignCollectionChannelUserModalProps) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [maxOutstandingAmount, setMaxOutstandingAmount] = useState('')

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return users.slice(start, start + PAGE_SIZE)
  }, [page, users])
  const selectedUser = useMemo(
    () => users.find((user) => user.userId === selectedUserId) ?? null,
    [selectedUserId, users],
  )

  useEffect(() => {
    if (!open) {
      setSearch('')
      setPage(1)
      setSelectedUserId(null)
      setMaxOutstandingAmount('')
      return
    }

    void loadUsers()
  }, [open])

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  if (!open) return null

  const parsedMaxOutstandingAmount = Number(maxOutstandingAmount)
  const isLimitValid =
    maxOutstandingAmount.trim().length > 0 &&
    Number.isFinite(parsedMaxOutstandingAmount) &&
    parsedMaxOutstandingAmount > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Asignar usuario
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Define el usuario y su límite máximo de saldo pendiente dentro del canal.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Solo se muestran usuarios con el permiso operativo `collection_channels.operate`.
          </p>
        </div>

        <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-hidden">
          <ListFiltersBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(1)
              void loadUsers(value)
            }}
            placeholder="Buscar por usuario o correo..."
            status="active"
            onStatusChange={() => undefined}
            showStatus={false}
          />

          <TableContainer mode="legacy-compact" variant="strong" className="h-full">
            <div className="max-h-[52vh] overflow-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="text-left">Acción</th>
                    <th className="text-left">Usuario</th>
                    <th className="text-left">Correo</th>
                    <th className="text-left">Agencia</th>
                    <th className="text-left">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        Consultando usuarios elegibles...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                        {error}
                      </td>
                    </tr>
                  ) : !paginatedUsers.length ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                        No se encontraron usuarios elegibles con ese filtro.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isSelected = selectedUserId === user.userId
                      return (
                        <tr key={user.userId} className={isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}>
                          <td>
                            <button
                              type="button"
                              className="btn-table-action border border-primary/40 bg-primary/10 text-primary-700 hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary-200 dark:hover:bg-primary/30"
                              onClick={() => setSelectedUserId(user.userId)}
                            >
                              {isSelected ? 'Seleccionado' : 'Seleccionar'}
                            </button>
                          </td>
                          <td className="font-medium text-slate-800 dark:text-slate-100">
                            {user.userName}
                          </td>
                          <td>{user.email}</td>
                          <td>{user.agencyName?.trim() || 'Sin agencia'}</td>
                          <td>
                            {user.hasActiveChannelAssignment ? (
                              <span className="text-amber-700 dark:text-amber-300">
                                Asignado a {user.currentChannelCode ?? '—'}
                              </span>
                            ) : (
                              <span className="text-emerald-700 dark:text-emerald-300">Disponible</span>
                            )}
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
              totalPages={totalPages}
              onPageChange={(nextPage) => setPage(Math.max(1, nextPage))}
            />
          </TableContainer>
        </div>

        {selectedUser ? (
          <div className="mt-4 space-y-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <p className="font-medium text-slate-800 dark:text-slate-100">
              {selectedUser.userName} - {selectedUser.email}
            </p>
            <p>Agencia: {selectedUser.agencyName?.trim() || 'Sin agencia'}</p>
            {selectedUser.hasActiveChannelAssignment ? (
              <p className="text-amber-700 dark:text-amber-300">
                Canal actual: {selectedUser.currentChannelCode ?? '—'} -{' '}
                {selectedUser.currentChannelName ?? 'Sin nombre'}
              </p>
            ) : null}
            <div className="space-y-2">
              <label
                htmlFor="assign-user-max-outstanding-amount"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Límite máximo de saldo pendiente del usuario
              </label>
              <input
                id="assign-user-max-outstanding-amount"
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={maxOutstandingAmount}
                disabled={isAssigning || isLoadingUsers}
                onChange={(event) => setMaxOutstandingAmount(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Campo obligatorio. Debe ser mayor que 0 para asignar el usuario al canal.
              </p>
              {maxOutstandingAmount.trim().length > 0 && !isLimitValid ? (
                <p className="text-xs text-red-500">
                  El límite máximo de saldo pendiente debe ser un monto mayor que 0.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm"
            disabled={isAssigning || isLoadingUsers}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isAssigning || isLoadingUsers || !selectedUserId || !isLimitValid}
            onClick={() => {
              if (!selectedUserId || !isLimitValid) return
              void onSubmit(selectedUserId, parsedMaxOutstandingAmount)
            }}
          >
            {isAssigning ? 'Asignando...' : 'Asignar usuario'}
          </button>
        </div>
      </div>
    </div>
  )
}
