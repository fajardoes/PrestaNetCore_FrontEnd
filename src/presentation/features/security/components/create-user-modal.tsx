import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'
import {
  createUserSchema,
  type CreateUserFormValues,
} from '@/infrastructure/validations/security/create-user.schema'
import { UserRolesSelector } from '@/presentation/features/security/components/user-roles-selector'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: CreateUserFormValues) => Promise<void> | void
  availableRoles: SecurityRole[]
  availableAgencies: Agency[]
  agenciesLoading?: boolean
  rolesLoading?: boolean
  isSaving?: boolean
  error?: string | null
}

export const CreateUserModal = ({
  open,
  onClose,
  onSubmit,
  availableRoles,
  availableAgencies,
  agenciesLoading,
  rolesLoading,
  isSaving,
  error,
}: CreateUserModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      roles: [],
      agencyId: '',
      queryOfficeIds: [],
    },
  })

  const selectedRoles = watch('roles')
  const selectedQueryOfficeIds = watch('queryOfficeIds')
  const agenciesForSelect = useMemo(
    () => availableAgencies ?? [],
    [availableAgencies],
  )
  const [selectedAgency, setSelectedAgency] = useState<
    AsyncSelectOption<Agency> | null
  >(null)
  const [selectedQueryOffices, setSelectedQueryOffices] = useState<
    AsyncSelectOption<Agency>[]
  >([])

  useEffect(() => {
    if (open) {
      reset({
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        agencyId: '',
        roles: [],
        queryOfficeIds: [],
      })
      setSelectedAgency(null)
      setSelectedQueryOffices([])
    }
  }, [open, reset])

  useEffect(() => {
    if (!selectedAgency?.value || !selectedQueryOfficeIds?.length) return

    const filtered = selectedQueryOfficeIds.filter(
      (officeId) => officeId !== selectedAgency.value,
    )
    if (filtered.length !== selectedQueryOfficeIds.length) {
      setValue('queryOfficeIds', filtered, { shouldValidate: true })
      setSelectedQueryOffices((prev) =>
        prev.filter((option) => option.value !== selectedAgency.value),
      )
    }
  }, [selectedAgency, selectedQueryOfficeIds, setValue])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  const loadAgencyOptions = async (inputValue: string) => {
    const term = inputValue.trim().toLowerCase()
    const filtered = agenciesForSelect.filter((agency) => {
      if (!term) return true
      return (
        agency.name.toLowerCase().includes(term) ||
        agency.code.toLowerCase().includes(term)
      )
    })
    return filtered.map((agency) => ({
      value: agency.id,
      label: `${agency.code} - ${agency.name}`,
      meta: agency,
    }))
  }

  const getQueryOfficeOptions = (inputValue: string) => {
    const term = inputValue.trim().toLowerCase()
    const filtered = agenciesForSelect.filter((agency) => {
      if (selectedAgency?.value === agency.id) {
        return false
      }

      if (!term) return true
      return (
        agency.name.toLowerCase().includes(term) ||
        agency.code.toLowerCase().includes(term)
      )
    })

    return filtered.map((agency) => ({
      value: agency.id,
      label: `${agency.code} - ${agency.name}`,
      meta: agency,
    }))
  }

  const loadQueryOfficeOptions = async (inputValue: string) =>
    getQueryOfficeOptions(inputValue)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Crear nuevo usuario
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define correo, clave temporal y roles iniciales.
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Contraseña temporal
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('password')}
                disabled={isSaving}
              />
              {errors.password ? (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('confirmPassword')}
                disabled={isSaving}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="agencyId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Agencia
              </label>
              <AsyncSelect<Agency>
                value={selectedAgency}
                onChange={(option) => {
                  setSelectedAgency(option)
                  setValue('agencyId', option?.value ?? '', { shouldValidate: true })
                }}
                loadOptions={loadAgencyOptions}
                placeholder="Buscar agencia..."
                inputId="agencyId"
                instanceId="security-user-agency"
                isDisabled={isSaving || agenciesLoading}
                defaultOptions={agenciesForSelect.map((agency) => ({
                  value: agency.id,
                  label: `${agency.code} - ${agency.name}`,
                  meta: agency,
                }))}
                noOptionsMessage="Sin agencias"
              />
              <input type="hidden" {...register('agencyId')} />
              {errors.agencyId ? (
                <p className="text-xs text-red-500">{errors.agencyId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="queryOfficeIds"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Oficinas de consulta
              </label>
              <AsyncSelect<Agency, true>
                value={selectedQueryOffices}
                onChange={(options) => {
                  const selected = options ?? []
                  setSelectedQueryOffices(selected)
                  setValue(
                    'queryOfficeIds',
                    selected.map((option) => option.value),
                    { shouldValidate: true },
                  )
                }}
                isMulti
                loadOptions={loadQueryOfficeOptions}
                placeholder="Buscar oficinas de consulta..."
                inputId="queryOfficeIds"
                instanceId="security-user-query-offices-create"
                isDisabled={isSaving || agenciesLoading}
                defaultOptions={getQueryOfficeOptions('')}
                noOptionsMessage="Sin oficinas"
              />
              <input type="hidden" {...register('queryOfficeIds')} />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Opcional. La oficina principal ya forma parte del alcance.
              </p>
            </div>
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
              onChange={(roles) =>
                setValue('roles', roles, { shouldValidate: true })
              }
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
              {isSaving ? 'Creando...' : 'Crear usuario'}
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
