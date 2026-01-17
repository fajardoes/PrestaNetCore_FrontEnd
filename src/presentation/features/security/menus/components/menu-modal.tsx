import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  menuSchema,
  type MenuFormValues,
} from '@/infrastructure/validations/security/menu.schema'
import type {
  MenuItemAdminDto,
} from '@/infrastructure/interfaces/security/menu'
import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

interface ParentOption {
  id: string
  label: string
}

interface MenuModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: MenuFormValues) => Promise<void> | void
  isSaving?: boolean
  error?: string | null
  menu?: MenuItemAdminDto | null
  parentOptions: ParentOption[]
  availableRoles: SecurityRole[]
  rolesLoading?: boolean
}

export const MenuModal = ({
  open,
  onClose,
  onSubmit,
  isSaving,
  error,
  menu,
  parentOptions,
  availableRoles,
  rolesLoading,
}: MenuModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      title: '',
      slug: '',
      route: null,
      icon: null,
      order: 0,
      isActive: true,
      parentId: null,
      allowedRoleIds: [],
    },
  })

  const selectedRoles = watch('allowedRoleIds') ?? []

  useEffect(() => {
    if (menu && open) {
      reset({
        title: menu.title,
        slug: menu.slug,
        route: menu.route ?? '',
        icon: menu.icon ?? '',
        order: menu.order,
        isActive: menu.isActive,
        parentId: menu.parentId ?? '',
        allowedRoleIds: menu.allowedRoleIds ?? [],
      })
    } else if (open) {
      reset({
        title: '',
        slug: '',
        route: '',
        icon: '',
        order: 0,
        isActive: true,
        parentId: '',
        allowedRoleIds: [],
      })
    }
  }, [menu, open, reset])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  const toggleRole = (roleId: string) => {
    if (isSaving) return
    if (selectedRoles.includes(roleId)) {
      setValue(
        'allowedRoleIds',
        selectedRoles.filter((id) => id !== roleId),
      )
      return
    }
    setValue('allowedRoleIds', [...selectedRoles, roleId])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {menu ? 'Editar menu' : 'Crear menu'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configura titulo, ruta, roles permitidos y jerarquia.
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Titulo
              </label>
              <input
                id="title"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('title')}
                disabled={isSaving}
              />
              {errors.title ? (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Slug
              </label>
              <input
                id="slug"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('slug')}
                disabled={isSaving}
              />
              {errors.slug ? (
                <p className="text-xs text-red-500">{errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="route"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Ruta (opcional)
              </label>
              <input
                id="route"
                type="text"
                placeholder="/catalogos/productos"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('route')}
                disabled={isSaving}
              />
              {errors.route ? (
                <p className="text-xs text-red-500">{errors.route.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="icon"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Icono (lucide)
              </label>
              <input
                id="icon"
                type="text"
                placeholder="Home"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('icon')}
                disabled={isSaving}
              />
              {errors.icon ? (
                <p className="text-xs text-red-500">{errors.icon.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="order"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Orden
              </label>
              <input
                id="order"
                type="number"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('order', { valueAsNumber: true })}
                disabled={isSaving}
              />
              {errors.order ? (
                <p className="text-xs text-red-500">{errors.order.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="parentId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Menu padre
              </label>
              <select
                id="parentId"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('parentId')}
                disabled={isSaving}
              >
                <option value="">Sin padre</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.parentId ? (
                <p className="text-xs text-red-500">{errors.parentId.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                Menu activo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controla si el menu es visible para usuarios finales.
              </p>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isActive')}
                disabled={isSaving}
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Activo
              </span>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Roles permitidos
            </p>
            {rolesLoading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cargando roles...
              </p>
            ) : !availableRoles.length ? (
              <p className="text-sm text-red-600 dark:text-red-300">
                No hay roles configurados. Solicita a un administrador que los cree.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {availableRoles.map((role) => {
                  const roleId = role.id ?? role.name
                  const checked = selectedRoles.includes(roleId)
                  return (
                    <label
                      key={roleId}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-primary/50"
                    >
                      <span className="flex flex-col">
                        <span className="font-semibold">{role.name}</span>
                        {role.description ? (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {role.description}
                          </span>
                        ) : null}
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900"
                        checked={checked}
                        onChange={() => toggleRole(roleId)}
                        disabled={isSaving}
                      />
                    </label>
                  )
                })}
              </div>
            )}
            {errors.allowedRoleIds ? (
              <p className="text-xs text-red-500">
                {errors.allowedRoleIds.message}
              </p>
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
              {isSaving ? 'Guardando...' : menu ? 'Guardar cambios' : 'Crear'}
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
