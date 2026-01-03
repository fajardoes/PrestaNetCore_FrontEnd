import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  loanCatalogSchema,
  type LoanCatalogFormValues,
} from '@/presentation/features/loans/catalogs/components/loan-catalog.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

interface LoanCatalogFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: LoanCatalogFormValues) => Promise<void> | void
  isSaving?: boolean
  error?: string | null
  catalog?: LoanCatalogItemDto | null
}

const toOptionalNumber = (value: string) => (value === '' ? null : Number(value))

export const LoanCatalogFormDialog = ({
  open,
  onClose,
  onSubmit,
  isSaving,
  error,
  catalog,
}: LoanCatalogFormDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanCatalogFormValues>({
    resolver: yupResolver(loanCatalogSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    },
  })

  useEffect(() => {
    if (catalog && open) {
      reset({
        code: catalog.code,
        name: catalog.name,
        description: catalog.description ?? '',
        sortOrder: catalog.sortOrder ?? 0,
        isActive: catalog.isActive,
      })
    } else if (open) {
      reset({
        code: '',
        name: '',
        description: '',
        sortOrder: 0,
        isActive: true,
      })
    }
  }, [catalog, open, reset])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    const normalized: LoanCatalogFormValues = {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      sortOrder: values.sortOrder ?? 0,
    }
    await onSubmit(normalized)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {catalog ? 'Editar registro' : 'Nuevo registro'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define código, nombre y orden de visualización.
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Código
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('code')}
                disabled={isSaving}
              />
              {errors.code ? (
                <p className="text-xs text-red-500">{errors.code.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Nombre
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('name')}
                disabled={isSaving}
              />
              {errors.name ? (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Descripción
              </label>
              <textarea
                className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('description')}
                disabled={isSaving}
              />
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Orden
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('sortOrder', {
                  setValueAs: toOptionalNumber,
                })}
                disabled={isSaving}
              />
              {errors.sortOrder ? (
                <p className="text-xs text-red-500">{errors.sortOrder.message}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                  {...register('isActive')}
                  disabled={isSaving}
                />
                Activo
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
