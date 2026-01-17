import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  clientCatalogSchema,
  type ClientCatalogFormValues,
} from '@/infrastructure/validations/clients/catalog.schema'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'

interface ClientCatalogModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: ClientCatalogFormValues) => Promise<void> | void
  isSaving?: boolean
  error?: string | null
  catalog?: ClientCatalogItem | null
  title: string
}

export const ClientCatalogModal = ({
  open,
  onClose,
  onSubmit,
  isSaving,
  error,
  catalog,
  title,
}: ClientCatalogModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientCatalogFormValues>({
    resolver: zodResolver(clientCatalogSchema),
    defaultValues: {
      parentId: null,
      slug: '',
      nombre: '',
      descripcion: '',
      activo: true,
    },
  })

  useEffect(() => {
    if (catalog && open) {
      reset({
        parentId: catalog.parentId ?? null,
        slug: catalog.slug,
        nombre: catalog.nombre,
        descripcion: catalog.descripcion ?? '',
        activo: catalog.activo,
      })
    } else if (open) {
      reset({
        parentId: null,
        slug: '',
        nombre: '',
        descripcion: '',
        activo: true,
      })
    }
  }, [catalog, open, reset])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {catalog ? `Editar ${title}` : `Nuevo ${title}`}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define slug, nombre y estado para este catálogo.
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Nombre
              </label>
              <input
                id="nombre"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('nombre')}
                disabled={isSaving}
              />
              {errors.nombre ? (
                <p className="text-xs text-red-500">{errors.nombre.message}</p>
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
          </div>

          <div className="space-y-2">
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Descripción
            </label>
            <textarea
              id="descripcion"
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('descripcion')}
              disabled={isSaving}
            />
            {errors.descripcion ? (
              <p className="text-xs text-red-500">
                {errors.descripcion.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">
                Estado
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Controla si el elemento puede usarse en formularios.
              </p>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('activo')}
                disabled={isSaving}
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Activo
              </span>
            </label>
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
              {isSaving ? 'Guardando...' : catalog ? 'Guardar cambios' : 'Crear'}
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
