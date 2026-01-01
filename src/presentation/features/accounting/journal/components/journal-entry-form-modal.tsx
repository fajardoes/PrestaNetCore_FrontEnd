import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { JournalEntryFormValues } from '@/infrastructure/validations/accounting/journal-entry.schema'

interface JournalEntryFormModalProps {
  open: boolean
  onClose: () => void
  form: UseFormReturn<JournalEntryFormValues>
  onSubmit: () => void
  isSaving: boolean
  isLoading?: boolean
  error?: string | null
  isEdit?: boolean
  accounts: ChartAccountListItem[]
  costCenters?: CostCenter[]
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const parseAmount = (value: string | number): number => {
  if (value === '' || value === null || value === undefined) return 0
  const normalized = String(value).replace(',', '.')
  const parsed = parseFloat(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

export const JournalEntryFormModal = ({
  open,
  onClose,
  form,
  onSubmit,
  isSaving,
  isLoading = false,
  error,
  isEdit = false,
  accounts,
  costCenters = [],
}: JournalEntryFormModalProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lines',
  })

  const watchedLines = useWatch({
    control,
    name: 'lines',
  }) ?? []
  const linesError = (errors.lines as { message?: string } | undefined)?.message

  const totals = watchedLines.reduce(
    (sum, line) => ({
      debit: sum.debit + (Number(line?.debit) || 0),
      credit: sum.credit + (Number(line?.credit) || 0),
    }),
    { debit: 0, credit: 0 },
  )
  const diff = totals.debit - totals.credit

  const handleNumericKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'e' || event.key === 'E' || event.key === '+' || event.key === '-') {
      event.preventDefault()
    }
  }

  const handleSanitizeInput = (event: ChangeEvent<HTMLInputElement>) => {
    const cleaned = event.currentTarget.value.replace(/[^0-9.,]/g, '').replace(',', '.')
    const parts = cleaned.split('.')
    const normalized = parts.shift() + (parts.length ? `.${parts.join('')}` : '')
    event.currentTarget.value = normalized
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {isEdit ? 'Editar asiento contable' : 'Nuevo asiento contable'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Completa la cabecera y las líneas del asiento antes de guardar en borrador.
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

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Cargando información del asiento...
          </div>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Fecha
                </label>
                <input
                  id="date"
                  type="date"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                  {...register('date')}
                  disabled={isSaving}
                />
                {errors.date ? (
                  <p className="text-xs text-red-500">{errors.date.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="costCenterId"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Centro de costo (opcional)
                </label>
                <select
                  id="costCenterId"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                  {...register('costCenterId')}
                  disabled={isSaving}
                >
                  <option value="">Sin centro</option>
                  {costCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.code} - {center.name}
                    </option>
                  ))}
                </select>
                {errors.costCenterId ? (
                  <p className="text-xs text-red-500">
                    {errors.costCenterId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-3">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Descripción
                </label>
                <input
                  id="description"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                  {...register('description')}
                  disabled={isSaving}
                />
                {errors.description ? (
                  <p className="text-xs text-red-500">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Cuenta
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Descripción
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Debe
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Haber
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Referencia
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {fields.map((field, index) => {
                      const lineErrors = errors.lines?.[index]
                      const lineLevelMessage =
                        typeof lineErrors?.message === 'string' ? lineErrors.message : null
                      return (
                        <tr
                          key={field.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                        >
                          <td className="px-3 py-2 text-sm">
                            <select
                              className="w-full min-w-[180px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.accountId` as const)}
                              disabled={isSaving}
                            >
                              <option value="">Selecciona una cuenta</option>
                              {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.code} - {account.name}
                                </option>
                              ))}
                            </select>
                            {lineErrors?.accountId ? (
                              <p className="mt-1 text-xs text-red-500">
                                {lineErrors.accountId.message}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <input
                              type="text"
                              className="w-full min-w-[160px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.description` as const)}
                              disabled={isSaving}
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            <input
                              type="text"
                              className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              inputMode="decimal"
                              pattern="[0-9]*[.,]?[0-9]*"
                              onKeyDown={handleNumericKeyDown}
                              onInput={handleSanitizeInput}
                              {...register(`lines.${index}.debit` as const, {
                                setValueAs: (value) => parseAmount(value),
                              })}
                              disabled={isSaving}
                            />
                            {lineErrors?.debit ? (
                              <p className="mt-1 text-xs text-red-500">
                                {lineErrors.debit.message}
                              </p>
                            ) : null}
                            {lineLevelMessage ? (
                              <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                                {lineLevelMessage}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            <input
                              type="text"
                              className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              inputMode="decimal"
                              pattern="[0-9]*[.,]?[0-9]*"
                              onKeyDown={handleNumericKeyDown}
                              onInput={handleSanitizeInput}
                              {...register(`lines.${index}.credit` as const, {
                                setValueAs: (value) => parseAmount(value),
                              })}
                              disabled={isSaving}
                            />
                            {lineErrors?.credit ? (
                              <p className="mt-1 text-xs text-red-500">
                                {lineErrors.credit.message}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <input
                              type="text"
                              className="w-full min-w-[140px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.reference` as const)}
                              disabled={isSaving}
                            />
                          </td>
                          <td className="px-3 py-2 text-right text-sm">
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="btn-icon"
                              aria-label="Eliminar línea"
                              disabled={isSaving || fields.length === 1}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {typeof linesError === 'string' && linesError ? (
                <div className="border-t border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
                  {linesError}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() =>
                  append({
                    accountId: '',
                    description: '',
                    debit: 0,
                    credit: 0,
                    reference: '',
                  })
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                disabled={isSaving}
              >
                Agregar línea
              </button>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <span>
                  Total Debe: <strong>{formatAmount(totals.debit)}</strong>
                </span>
                <span>
                  Total Haber: <strong>{formatAmount(totals.credit)}</strong>
                </span>
                <span
                  className={
                    diff === 0
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-amber-600 dark:text-amber-300'
                  }
                >
                  Diferencia: <strong>{formatAmount(Math.abs(diff))}</strong>
                </span>
              </div>
            </div>

            {diff !== 0 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200">
                El asiento está desbalanceado. Revisa los montos antes de guardar.
              </div>
            ) : null}

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
                {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar borrador'}
              </button>
            </div>
          </form>
        )}
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

const TrashIcon = ({ className }: { className?: string }) => (
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
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)
