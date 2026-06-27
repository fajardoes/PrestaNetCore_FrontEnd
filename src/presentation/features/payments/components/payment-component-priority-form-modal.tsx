import { useEffect } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import {
  paymentComponentPrioritySchema,
  type PaymentComponentPriorityFormValues,
} from '@/infrastructure/validations/payments/payment-component-priority.schema'

interface PaymentComponentPriorityFormModalProps {
  open: boolean
  priority?: PaymentComponentPriorityResponse | null
  isSaving: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: PaymentComponentPriorityFormValues) => Promise<void> | void
}

const defaultValues: PaymentComponentPriorityFormValues = {
  componentCode: '',
  componentName: '',
  priorityOrder: 10,
  isActive: true,
  notes: '',
}

export const PaymentComponentPriorityFormModal = ({
  open,
  priority,
  isSaving,
  error,
  onClose,
  onSubmit,
}: PaymentComponentPriorityFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentComponentPriorityFormValues>({
    resolver: zodResolver(paymentComponentPrioritySchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    if (priority) {
      reset({
        componentCode: priority.componentCode,
        componentName: priority.componentName,
        priorityOrder: priority.priorityOrder,
        isActive: priority.isActive,
        notes: priority.notes ?? '',
      })
      return
    }
    reset(defaultValues)
  }, [open, priority, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {priority ? 'Editar prioridad de cobro' : 'Nueva prioridad de cobro'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Menor orden implica cobro primero. El código del componente se normaliza en mayúsculas.
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
              id="componentCode"
              label="Código del componente"
              error={errors.componentCode?.message}
              disabled={isSaving}
              register={register('componentCode')}
              placeholder="INTEREST"
            />
            <InputField
              id="componentName"
              label="Nombre del componente"
              error={errors.componentName?.message}
              disabled={isSaving}
              register={register('componentName')}
              placeholder="Interés"
            />
            <div className="space-y-2">
              <label
                htmlFor="priorityOrder"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Orden de prioridad
              </label>
              <input
                id="priorityOrder"
                type="number"
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={isSaving}
                {...register('priorityOrder', { valueAsNumber: true })}
              />
              {errors.priorityOrder ? (
                <p className="text-xs text-red-500">{errors.priorityOrder.message}</p>
              ) : null}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">Prioridad activa</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Los componentes inactivos quedan fuera del orden efectivo.
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
              htmlFor="notes"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Notas
            </label>
            <textarea
              id="notes"
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              disabled={isSaving}
              placeholder="Se cobra antes que capital."
              {...register('notes')}
            />
            {errors.notes ? <p className="text-xs text-red-500">{errors.notes.message}</p> : null}
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
              {isSaving ? 'Guardando...' : priority ? 'Guardar cambios' : 'Crear prioridad'}
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
