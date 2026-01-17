import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'
import type { DelinquencyPolicyFormValues } from '@/presentation/components/loans/delinquency/delinquency-policy-form.schema'

interface DelinquencyBucketsEditorProps {
  control: Control<DelinquencyPolicyFormValues>
  register: UseFormRegister<DelinquencyPolicyFormValues>
  errors: FieldErrors<DelinquencyPolicyFormValues>
  disabled?: boolean
}

const defaultBucket = (sortOrder: number) => ({
  id: null,
  code: '',
  name: '',
  fromDays: 0,
  toDays: 0,
  sortOrder,
  isActive: true,
})

export const DelinquencyBucketsEditor = ({
  control,
  register,
  errors,
  disabled,
}: DelinquencyBucketsEditorProps) => {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'buckets',
  })
  const buckets = useWatch({ control, name: 'buckets' }) ?? []

  const handleAdd = () => {
    const nextOrder = buckets.length
      ? Math.max(...buckets.map((bucket) => bucket.sortOrder ?? 0)) + 1
      : 1
    append(defaultBucket(nextOrder))
  }

  const handleSort = () => {
    const sorted = [...buckets].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
    replace(sorted)
  }

  const bucketsError = (errors.buckets as { message?: string } | undefined)
    ?.message

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Buckets de mora
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define los rangos de días y su orden de aplicación.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary px-3 py-1.5 text-xs"
            onClick={handleSort}
            disabled={disabled || buckets.length < 2}
          >
            Ordenar por orden
          </button>
          <button
            type="button"
            className="btn-primary px-3 py-1.5 text-xs"
            onClick={handleAdd}
            disabled={disabled}
          >
            Agregar bucket
          </button>
        </div>
      </div>

      {fields.length ? (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const bucket = buckets[index]
            const rowErrors = Array.isArray(errors.buckets)
              ? errors.buckets[index]
              : undefined
            const isInactive = bucket?.isActive === false

            return (
              <div
                key={field.id}
                className={`rounded-xl border p-4 shadow-sm ${
                  isInactive
                    ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-500/10'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                <div className="grid gap-3 md:grid-cols-6">
                  <div className="space-y-1 md:col-span-1">
                    <label
                      htmlFor={`buckets.${index}.code`}
                      className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      Código
                    </label>
                    <input
                      id={`buckets.${index}.code`}
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                      disabled={disabled}
                      {...register(`buckets.${index}.code`)}
                    />
                    {rowErrors?.code ? (
                      <p className="text-xs text-red-500">
                        {rowErrors.code.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label
                      htmlFor={`buckets.${index}.name`}
                      className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      Nombre
                    </label>
                    <input
                      id={`buckets.${index}.name`}
                      type="text"
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                      disabled={disabled}
                      {...register(`buckets.${index}.name`)}
                    />
                    {rowErrors?.name ? (
                      <p className="text-xs text-red-500">
                        {rowErrors.name.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`buckets.${index}.fromDays`}
                      className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      Desde
                    </label>
                    <input
                      id={`buckets.${index}.fromDays`}
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                      disabled={disabled}
                      {...register(`buckets.${index}.fromDays`, {
                        valueAsNumber: true,
                      })}
                    />
                    {rowErrors?.fromDays ? (
                      <p className="text-xs text-red-500">
                        {rowErrors.fromDays.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`buckets.${index}.toDays`}
                      className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      Hasta
                    </label>
                    <input
                      id={`buckets.${index}.toDays`}
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                      disabled={disabled}
                      {...register(`buckets.${index}.toDays`, {
                        valueAsNumber: true,
                      })}
                    />
                    {rowErrors?.toDays ? (
                      <p className="text-xs text-red-500">
                        {rowErrors.toDays.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor={`buckets.${index}.sortOrder`}
                      className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400"
                    >
                      Orden
                    </label>
                    <input
                      id={`buckets.${index}.sortOrder`}
                      type="number"
                      min={0}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                      disabled={disabled}
                      {...register(`buckets.${index}.sortOrder`, {
                        valueAsNumber: true,
                      })}
                    />
                    {rowErrors?.sortOrder ? (
                      <p className="text-xs text-red-500">
                        {rowErrors.sortOrder.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                      disabled={disabled}
                      {...register(`buckets.${index}.isActive`)}
                    />
                    Activo
                  </label>

                  <button
                    type="button"
                    className="btn-icon-label text-xs text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                    onClick={() => remove(index)}
                    disabled={disabled}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay buckets registrados.
        </p>
      )}

      {bucketsError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {bucketsError}
        </div>
      ) : null}
    </div>
  )
}
