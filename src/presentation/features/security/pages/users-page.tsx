import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { EditUserFormValues } from '@/infrastructure/validations/security/edit-user.schema'
import type { CreateUserFormValues } from '@/infrastructure/validations/security/create-user.schema'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import { useAssignRoles } from '@/presentation/features/security/hooks/use-assign-roles'
import { useCreateUser } from '@/presentation/features/security/hooks/use-create-user'
import { useEditUser } from '@/presentation/features/security/hooks/use-edit-user'
import { useUsers } from '@/presentation/features/security/hooks/use-users'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { CreateUserModal } from '@/presentation/features/security/components/create-user-modal'
import { EditUserModal } from '@/presentation/features/security/components/edit-user-modal'
import { TemporaryPasswordModal } from '@/presentation/features/security/components/temporary-password-modal'
import { UsersTable } from '@/presentation/features/security/components/users-table'

export const UsersPage = () => {
  const { user } = useAuth()
  const isAdmin = useMemo(
    () =>
      user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false,
    [user?.roles],
  )

  const {
    users,
    error,
    isLoading,
    query,
    setQuery,
    page,
    totalPages,
    setPage,
    refresh,
  } = useUsers({ enabled: isAdmin })
  const { roles, isLoading: rolesLoading, error: rolesError } = useAssignRoles({
    enabled: isAdmin,
  })
  const {
    agencies,
    isLoading: agenciesLoading,
    error: agenciesError,
  } = useAgencies({ enabled: isAdmin })
  const {
    editUser,
    isSaving,
    error: editError,
  } = useEditUser()
  const {
    createUser,
    isSaving: isCreating,
    error: createError,
  } = useCreateUser()

  const [editingUser, setEditingUser] = useState<SecurityUser | null>(null)
  const [temporaryUser, setTemporaryUser] = useState<SecurityUser | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleEditSave = async (userId: string, values: EditUserFormValues) => {
    const result = await editUser({
      userId,
      email: values.email,
      phoneNumber: values.phoneNumber ?? null,
      isDeleted: values.isDeleted,
      roles: values.roles,
      agencyId: values.agencyId,
    })

    if (result.success) {
      await refresh()
      setEditingUser(null)
    }
  }

  const handleCreate = async (values: CreateUserFormValues) => {
    const result = await createUser({
      email: values.email,
      phoneNumber: values.phoneNumber ?? null,
      password: values.password,
      confirmPassword: values.confirmPassword,
      roles: values.roles,
      agencyId: values.agencyId,
    })

    if (result.success) {
      setIsCreateOpen(false)
      await refresh()
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar cuentas.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Seguridad y usuarios
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra cuentas, roles, contraseñas temporales y estados activos.
        </p>
        {rolesError ? (
          <p className="text-xs text-red-500">
            No fue posible cargar los roles: {rolesError}
          </p>
        ) : null}
      </div>

      <UsersTable
        users={users}
        isLoading={isLoading}
        error={error ?? agenciesError ?? rolesError}
        page={page}
        totalPages={totalPages}
        query={query}
        onQueryChange={setQuery}
        onPageChange={setPage}
        onEdit={setEditingUser}
        onGenerateTemporaryPassword={setTemporaryUser}
      />

      <div className="flex justify-end">
        <button
          type="button"
          className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setIsCreateOpen(true)}
          disabled={isLoading}
        >
          Nuevo usuario
        </button>
      </div>

      <EditUserModal
        user={editingUser}
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSubmit={handleEditSave}
        availableRoles={roles}
        rolesLoading={rolesLoading}
        isSaving={isSaving}
        error={editError}
        availableAgencies={agencies}
        agenciesLoading={agenciesLoading}
      />

      <TemporaryPasswordModal
        user={temporaryUser}
        open={Boolean(temporaryUser)}
        key={temporaryUser?.id ?? 'temp-none'}
        onClose={() => setTemporaryUser(null)}
      />

      <CreateUserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        availableRoles={roles}
        rolesLoading={rolesLoading}
        isSaving={isCreating}
        error={createError}
        availableAgencies={agencies}
        agenciesLoading={agenciesLoading}
      />
    </div>
  )
}
