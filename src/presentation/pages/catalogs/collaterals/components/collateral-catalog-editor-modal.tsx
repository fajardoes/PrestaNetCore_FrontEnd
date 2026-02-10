import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  collateralCatalogItemSchema,
  type CollateralCatalogItemFormValues,
} from '@/infrastructure/validations/collaterals/collateral-catalog-item.schema'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'

interface CollateralCatalogEditorModalProps {
  open: boolean
  item?: CollateralCatalogItemDto | null
  onClose: () => void
  onSubmit: (values: CollateralCatalogItemFormValues) => Promise<void> | void
  isSaving?: boolean
  error?: string | null
}

export const CollateralCatalogEditorModal = ({
  open,
  item,
  onClose,
  onSubmit,
  isSaving,
  error,
}: CollateralCatalogEditorModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollateralCatalogItemFormValues>({
    resolver: yupResolver(collateralCatalogItemSchema),
    defaultValues: {
      code: '',
      name: '',
      sortOrder: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    if (!open) return
    if (item) {
      reset({
        code: item.code,
        name: item.name,
        sortOrder: item.sortOrder ?? 0,
        isActive: item.isActive,
      })
      return
    }

    reset({
      code: '',
      name: '',
      sortOrder: 0,
      isActive: true,
    })
  }, [item, open, reset])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {item ? 'Editar registro' : 'Nuevo registro'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define código, nombre, orden y estado del catálogo.
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitHandler} noValidate>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Código
            </label>
            <input
              type="text"
              maxLength={30}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-70"
              {...register('code')}
              disabled={Boolean(item?.isSystem) || isSaving}
            />
            {item?.isSystem ? (
              <p className="text-xs text-amber-600 dark:text-amber-300">
                El código de un registro de sistema no puede editarse.
              </p>
            ) : null}
            {errors.code ? <p className="text-xs text-red-500">{errors.code.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Nombre
            </label>
            <input
              type="text"
              maxLength={80}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('name')}
              disabled={isSaving}
            />
            {errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Orden
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('sortOrder', {
                  setValueAs: (value) => {
                    if (value === '' || value === null || value === undefined) {
                      return null
                    }
                    return Number(value)
                  },
                })}
                disabled={isSaving}
              />
              {errors.sortOrder ? (
                <p className="text-xs text-red-500">{errors.sortOrder.message}</p>
              ) : null}
            </div>

            <div className="flex items-center">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                  {...register('isActive')}
                  disabled={isSaving}
                />
                Activa
              </label>
            </div>
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
              {isSaving ? 'Guardando...' : item ? 'Guardar cambios' : 'Crear'}
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
