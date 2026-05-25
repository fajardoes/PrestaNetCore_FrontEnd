import { useEffect, type SVGProps } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createRoleSchema,
  type CreateRoleFormValues,
} from '@/infrastructure/validations/security/create-role.schema'

interface CreateRoleModalProps {
  open: boolean
  isSaving?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: CreateRoleFormValues) => Promise<void> | void
}

export const CreateRoleModal = ({
  open,
  isSaving,
  error,
  onClose,
  onSubmit,
}: CreateRoleModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({ name: '' })
  }, [open, reset])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Crear rol
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Crea un rol nuevo para asignar permisos y acceso.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
            disabled={isSaving}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitHandler} noValidate>
          <div className="space-y-2">
            <label
              htmlFor="security-role-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Nombre del rol
            </label>
            <input
              id="security-role-name"
              type="text"
              placeholder="ej. comite_credito"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              disabled={isSaving}
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-sm"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm"
              disabled={isSaving}
            >
              {isSaving ? 'Creando...' : 'Crear rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
