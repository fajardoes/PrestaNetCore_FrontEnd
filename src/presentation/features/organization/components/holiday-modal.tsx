import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  holidaySchema,
  type HolidayFormValues,
} from '@/infrastructure/validations/organization/holiday.schema'
import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'

const HOLIDAY_TYPES = [
  { value: 1, label: 'Nacional' },
]

interface HolidayModalProps {
  open: boolean
  mode: 'create' | 'edit' | 'view'
  holiday?: HolidayListItemDto | null
  onClose: () => void
  onSubmit: (values: HolidayFormValues) => Promise<void> | void
  isSubmitting: boolean
  error?: string | null
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export const HolidayModal = ({
  open,
  mode,
  holiday,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: HolidayModalProps) => {
  const isReadOnly = mode === 'view'
  const typeOptions = useMemo(() => {
    if (holiday?.type && !HOLIDAY_TYPES.some((item) => item.value === holiday.type)) {
      return [{ value: holiday.type, label: `Tipo ${holiday.type}` }, ...HOLIDAY_TYPES]
    }
    return HOLIDAY_TYPES
  }, [holiday?.type])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormValues>({
    resolver: yupResolver(holidaySchema),
    defaultValues: {
      date: holiday?.date ?? todayIso(),
      name: holiday?.name ?? '',
      description: holiday?.description ?? '',
      type: holiday?.type ?? typeOptions[0]?.value ?? 1,
      isActive: holiday?.isActive ?? true,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      date: holiday?.date ?? todayIso(),
      name: holiday?.name ?? '',
      description: holiday?.description ?? '',
      type: holiday?.type ?? typeOptions[0]?.value ?? 1,
      isActive: holiday?.isActive ?? true,
    })
  }, [open, holiday, reset, typeOptions])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {mode === 'create'
                ? 'Crear feriado'
                : mode === 'edit'
                  ? 'Editar feriado'
                  : 'Detalle del feriado'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Gestiona fechas no hábiles del calendario institucional.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
            disabled={isSubmitting}
          >
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="holiday-date"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Fecha
              </label>
              <input
                id="holiday-date"
                type="date"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('date')}
                disabled={isSubmitting || isReadOnly}
              />
              {errors.date ? (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="holiday-type"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tipo
              </label>
              <select
                id="holiday-type"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('type', { valueAsNumber: true })}
                disabled={isSubmitting || isReadOnly}
              >
                {typeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type ? (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="holiday-name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Nombre
            </label>
            <input
              id="holiday-name"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('name')}
              disabled={isSubmitting || isReadOnly}
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="holiday-description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Descripción
            </label>
            <textarea
              id="holiday-description"
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('description')}
              disabled={isSubmitting || isReadOnly}
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900"
              {...register('isActive')}
              disabled={isSubmitting || isReadOnly}
            />
            Activo
          </label>

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
              disabled={isSubmitting}
            >
              {mode === 'view' ? 'Cerrar' : 'Cancelar'}
            </button>
            {mode !== 'view' ? (
              <button
                type="submit"
                className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : mode === 'create'
                    ? 'Crear feriado'
                    : 'Guardar cambios'}
              </button>
            ) : null}
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
