import { useEffect } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import {
  collectionChannelTypeSchema,
  type CollectionChannelTypeFormValues,
} from '@/infrastructure/validations/collection-channels/collection-channel-type.schema'

interface CollectionChannelTypeFormModalProps {
  open: boolean
  channelType?: CollectionChannelTypeResponse | null
  isSaving: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: CollectionChannelTypeFormValues) => Promise<void> | void
}

const defaultValues: CollectionChannelTypeFormValues = {
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  isActive: true,
}

export const CollectionChannelTypeFormModal = ({
  open,
  channelType,
  isSaving,
  error,
  onClose,
  onSubmit,
}: CollectionChannelTypeFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CollectionChannelTypeFormValues>({
    resolver: zodResolver(collectionChannelTypeSchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    if (channelType) {
      reset({
        code: channelType.code,
        name: channelType.name,
        description: channelType.description ?? '',
        sortOrder: channelType.sortOrder,
        isActive: channelType.isActive,
      })
      return
    }
    reset(defaultValues)
  }, [channelType, open, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {channelType ? 'Editar tipo de canal' : 'Nuevo tipo de canal'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Administra el catálogo persistido de tipos disponibles para canales operativos.
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              id="code"
              label="Código"
              error={errors.code?.message}
              disabled={isSaving}
              register={register('code')}
              placeholder="p. ej. TC-001"
            />
            <InputField
              id="name"
              label="Nombre"
              error={errors.name?.message}
              disabled={isSaving}
              register={register('name')}
              placeholder="p. ej. Caja de agencia"
            />
            <div className="space-y-2">
              <label
                htmlFor="sortOrder"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Orden
              </label>
              <input
                id="sortOrder"
                type="number"
                min="0"
                step="1"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={isSaving}
                {...register('sortOrder', { valueAsNumber: true })}
              />
              {errors.sortOrder ? (
                <p className="text-xs text-red-500">{errors.sortOrder.message}</p>
              ) : null}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Tipo activo</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Solo los tipos activos deben aparecer como opción operativa.
                </p>
              </div>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                  disabled={isSaving}
                  {...register('isActive')}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">Activo</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Descripción
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              disabled={isSaving}
              placeholder="Describe el uso funcional del tipo de canal."
              {...register('description')}
            />
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm" disabled={isSaving}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : channelType ? 'Guardar cambios' : 'Crear tipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const InputField = ({
  id,
  label,
  error,
  disabled,
  register,
  placeholder,
}: {
  id: string
  label: string
  error?: string
  disabled?: boolean
  register: UseFormRegisterReturn
  placeholder?: string
}) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </label>
    <input
      id={id}
      type="text"
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
      disabled={disabled}
      placeholder={placeholder}
      {...register}
    />
    {error ? <p className="text-xs text-red-500">{error}</p> : null}
  </div>
)

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
