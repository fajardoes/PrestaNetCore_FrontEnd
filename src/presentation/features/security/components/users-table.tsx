import { StatusBadge } from '@/presentation/features/security/components/status-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'

const PAGE_SIZE = 10

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
  const columns = [
    {
      key: 'user',
      header: 'Usuario',
      render: (user: SecurityUser) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {user.email}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {user.emailConfirmed ? 'Correo verificado' : 'Correo pendiente'}
          </div>
        </div>
      ),
      getTitle: (user: SecurityUser) => user.email,
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (user: SecurityUser) => user.phoneNumber ?? '—',
      getTitle: (user: SecurityUser) => user.phoneNumber ?? 'Sin teléfono',
    },
    {
      key: 'agency',
      header: 'Agencia',
      render: (user: SecurityUser) => (
        <div>
          <div className="font-medium text-slate-800 dark:text-slate-100">
            {user.agencyName ?? 'Casa Matriz'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {user.agencyCode ?? 'HQ'}
          </div>
        </div>
      ),
      getTitle: (user: SecurityUser) =>
        `${user.agencyName ?? 'Casa Matriz'} (${user.agencyCode ?? 'HQ'})`,
    },
    {
      key: 'roles',
      header: 'Roles',
      className: 'min-w-[220px]',
      render: (user: SecurityUser) => (
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
      ),
      getTitle: (user: SecurityUser) => user.roles.join(', '),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (user: SecurityUser) => (
        <StatusBadge
          isDeleted={user.isDeleted}
          mustChangePassword={user.mustChangePassword}
        />
      ),
      getTitle: (user: SecurityUser) =>
        user.mustChangePassword
          ? 'Requiere cambio'
          : user.isDeleted
            ? 'Inactivo'
            : 'Activo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[120px]',
      render: (user: SecurityUser) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="btn-table-action"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onGenerateTemporaryPassword(user)}
            className="btn-table-action w-7 px-0"
            aria-label="Generar contraseña temporal"
          >
            <KeyIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

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

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <TableTabular
        title="Listado de usuarios"
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        loadingMessage="Cargando usuarios..."
        emptyMessage={error ? 'No fue posible cargar los usuarios.' : 'No hay usuarios para mostrar.'}
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
