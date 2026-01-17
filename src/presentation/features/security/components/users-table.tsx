import { StatusBadge } from '@/presentation/features/security/components/status-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

interface UsersTableProps {
  users: SecurityUser[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onEdit: (user: SecurityUser) => void
  onGenerateTemporaryPassword: (user: SecurityUser) => void
}

export const UsersTable = ({
  users,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onGenerateTemporaryPassword,
}: UsersTableProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Usuarios
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gestión de cuentas, roles y estado activo/inactivo.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Agencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Roles
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                    colSpan={6}
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                    colSpan={6}
                  >
                    {error}
                  </td>
                </tr>
              ) : !users.length ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                    colSpan={6}
                  >
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      <div className="font-semibold">{user.email}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {user.emailConfirmed ? 'Correo verificado' : 'Correo pendiente'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {user.phoneNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.agencyName ?? 'Casa Matriz'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {user.agencyCode ?? 'HQ'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        isDeleted={user.isDeleted}
                        mustChangePassword={user.mustChangePassword}
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(user)}
                          className="btn-icon-label"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onGenerateTemporaryPassword(user)}
                          className="btn-icon"
                          aria-label="Generar contraseña temporal"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}

const KeyIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M15 7a5 5 0 1 0-4.09 4.91V14a2 2 0 0 0 2 2h1v2h2v2h2v-4.09A5 5 0 0 0 15 7Z" />
    <path d="M10 7h.01" />
  </svg>
)
