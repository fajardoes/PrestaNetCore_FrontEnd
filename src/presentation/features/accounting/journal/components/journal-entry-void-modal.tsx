import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  voidJournalEntrySchema,
  type VoidJournalEntryFormValues,
} from '@/infrastructure/validations/accounting/void-journal-entry.schema'
import type { JournalEntryListItem } from '@/infrastructure/interfaces/accounting/journal-entry'
import { DatePicker } from '@/presentation/share/components/date-picker'

interface JournalEntryVoidModalProps {
  open: boolean
  entry: JournalEntryListItem | null
  onClose: () => void
  onSubmit: (values: VoidJournalEntryFormValues) => Promise<void> | void
  isSubmitting: boolean
  error?: string | null
}

export const JournalEntryVoidModal = ({
  open,
  entry,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: JournalEntryVoidModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<VoidJournalEntryFormValues>({
    resolver: yupResolver(voidJournalEntrySchema),
    defaultValues: {
      reason: '',
      date: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({ reason: '', date: '' })
    }
  }, [open, reset])

  const date = watch('date')

  if (!open || !entry) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Anular asiento contable
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Esta acción generará un asiento inverso y marcará el original como anulado.
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

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p>
            <span className="font-semibold">Número:</span> {entry.number || '—'}
          </p>
          <p>
            <span className="font-semibold">Fecha:</span> {entry.date}
          </p>
          <p>
            <span className="font-semibold">Descripción:</span> {entry.description}
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => onSubmit(values))}
          noValidate
        >
          <div className="space-y-2">
            <label
              htmlFor="reason"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Motivo
            </label>
            <textarea
              id="reason"
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('reason')}
              disabled={isSubmitting}
            />
            {errors.reason ? (
              <p className="text-xs text-red-500">{errors.reason.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Fecha de anulación (opcional)
            </label>
            <DatePicker
              value={date}
              onChange={(value) =>
                setValue('date', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              onBlur={() =>
                setValue('date', getValues('date'), {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
              placeholder="Selecciona la fecha de anulación"
              error={errors.date?.message}
              disabled={isSubmitting}
            />
            <input type="hidden" {...register('date')} />
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
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Anulando...' : 'Confirmar anulación'}
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
