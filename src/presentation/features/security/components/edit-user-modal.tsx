import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import {
  editUserSchema,
  type EditUserFormValues,
} from '@/infrastructure/validations/security/edit-user.schema'
import { UserRolesSelector } from './user-roles-selector'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'

interface EditUserModalProps {
  user: SecurityUser | null
  open: boolean
  onClose: () => void
  onSubmit: (
    userId: string,
    values: EditUserFormValues,
  ) => Promise<void> | void
  availableRoles: SecurityRole[]
  availableAgencies: Agency[]
  agenciesLoading?: boolean
  rolesLoading?: boolean
  isSaving?: boolean
  error?: string | null
}

export const EditUserModal = ({
  user,
  open,
  onClose,
  onSubmit,
  availableRoles,
  availableAgencies,
  agenciesLoading,
  rolesLoading,
  isSaving,
  error,
}: EditUserModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      isDeleted: false,
      roles: [],
      agencyId: '',
    },
  })

  const selectedRoles = watch('roles')
  const agenciesForSelect = useMemo(
    () => availableAgencies ?? [],
    [availableAgencies],
  )

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        phoneNumber: user.phoneNumber ?? '',
        isDeleted: user.isDeleted,
        roles: user.roles ?? [],
        agencyId: user.agencyId ?? '',
      })
    }
  }, [reset, user])

  if (!open || !user) {
    return null
  }

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(user.id, values)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Editar usuario
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Actualiza los datos de contacto, roles y estado de la cuenta.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitHandler} noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Correo
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('email')}
                disabled={isSaving}
              />
              {errors.email ? (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="agencyId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Agencia
              </label>
              <select
                id="agencyId"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('agencyId')}
                disabled={isSaving || agenciesLoading}
              >
                <option value="">Selecciona una agencia</option>
                {agenciesForSelect.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.code} - {agency.name}
                  </option>
                ))}
              </select>
              {errors.agencyId ? (
                <p className="text-xs text-red-500">{errors.agencyId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Teléfono
              </label>
              <input
                id="phoneNumber"
                type="tel"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('phoneNumber')}
                disabled={isSaving}
              />
              {errors.phoneNumber ? (
                <p className="text-xs text-red-500">
                  {errors.phoneNumber.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isDeleted')}
                disabled={isSaving}
              />
              Marcar como inactivo
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Un usuario inactivo no podrá autenticarse hasta que sea
              reactivado.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Roles
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona al menos uno
              </span>
            </div>
            <UserRolesSelector
              availableRoles={availableRoles}
              value={selectedRoles}
              onChange={(roles) => setValue('roles', roles, { shouldValidate: true })}
              isLoading={rolesLoading}
              disabled={isSaving}
            />
            {errors.roles ? (
              <p className="text-xs text-red-500">{errors.roles.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CloseIcon = ({ className }: { className?: string }) => (
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
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
