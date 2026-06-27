import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { JournalEntryFormValues } from '@/infrastructure/validations/accounting/journal-entry.schema'
import AsyncSelect from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import { formatAccountingDate, getPeriodLabel } from '@/presentation/features/accounting/accounting-ui'

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
  businessDate?: string | null
  operationalPeriodLabel?: string
  adjustmentPeriods?: AccountingPeriodDto[]
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
  businessDate,
  operationalPeriodLabel,
  adjustmentPeriods = [],
}: JournalEntryFormModalProps) => {
  const menuPortalTarget = typeof document !== 'undefined' ? document.body : null

  const {
    register,
    control,
    setValue,
    getValues,
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
  const selectedCostCenterId = useWatch({
    control,
    name: 'costCenterId',
  })
  const selectedDate = useWatch({
    control,
    name: 'date',
  })
  const selectedEventDate = useWatch({
    control,
    name: 'eventDate',
  })
  const postingMode = useWatch({
    control,
    name: 'postingMode',
  })
  const selectedRequestedPostingPeriodId = useWatch({
    control,
    name: 'requestedPostingPeriodId',
  })
  const linesError = (errors.lines as { message?: string } | undefined)?.message
  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: `${account.code} - ${account.name}`,
  }))
  const costCenterOptions = costCenters.map((center) => ({
    value: center.id,
    label: `${center.code} - ${center.name}`,
  }))
  const postingModeOptions = [
    { value: 'MANUAL_REGULAR', label: 'Asiento manual regular' },
    { value: 'MANUAL_ADJUSTMENT', label: 'Ajuste manual' },
  ]
  const adjustmentPeriodOptions = adjustmentPeriods.map((period) => ({
    value: period.id,
    label: getPeriodLabel(period),
  }))
  const filterOptions = async (
    options: Array<{ value: string; label: string }>,
    inputValue: string,
  ) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }

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
      <div className="flex max-h-[92vh] w-full max-w-[92rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
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
          <form className="flex min-h-0 flex-1 flex-col gap-5" onSubmit={onSubmit} noValidate>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/50 dark:bg-sky-500/10 dark:text-sky-100">
              <p className="font-semibold">
                Fecha de negocio: {formatAccountingDate(businessDate)}
              </p>
              <p>Periodo operativo resuelto: {operationalPeriodLabel || '—'}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Fecha contable
                </label>
                <DatePicker
                  value={selectedDate}
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
                  placeholder="Selecciona una fecha"
                  error={errors.date?.message}
                  disabled={isSaving}
                />
                <input type="hidden" {...register('date')} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tipo de asiento
                </label>
                <AsyncSelect
                  value={
                    postingModeOptions.find((option) => option.value === postingMode) ?? null
                  }
                  onChange={(option) => {
                    const nextValue =
                      (option?.value as JournalEntryFormValues['postingMode']) ?? 'MANUAL_REGULAR'
                    setValue('postingMode', nextValue, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                    if (nextValue !== 'MANUAL_ADJUSTMENT') {
                      setValue('requestedPostingPeriodId', '', {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                  }}
                  loadOptions={(inputValue) => filterOptions(postingModeOptions, inputValue)}
                  defaultOptions={postingModeOptions}
                  isClearable={false}
                  isDisabled={isSaving}
                  instanceId="accounting-journal-entry-posting-mode"
                  noOptionsMessage="Sin modos"
                />
                <input type="hidden" {...register('postingMode')} />
                {errors.postingMode ? (
                  <p className="text-xs text-red-500">{errors.postingMode.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Fecha del evento (opcional)
                </label>
                <DatePicker
                  value={selectedEventDate ?? ''}
                  onChange={(value) =>
                    setValue('eventDate', value, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                  onBlur={() =>
                    setValue('eventDate', getValues('eventDate'), {
                      shouldValidate: true,
                      shouldTouch: true,
                    })
                  }
                  placeholder="Selecciona una fecha"
                  disabled={isSaving}
                />
                <input type="hidden" {...register('eventDate')} />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="costCenterId"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Centro de costo (opcional)
                </label>
                <AsyncSelect
                  value={
                    costCenterOptions.find((option) => option.value === selectedCostCenterId) ??
                    null
                  }
                  onChange={(option) =>
                    setValue('costCenterId', option?.value ?? '', {
                      shouldValidate: true,
                    })
                  }
                  loadOptions={(inputValue) => filterOptions(costCenterOptions, inputValue)}
                  inputId="costCenterId"
                  instanceId="accounting-journal-entry-cost-center-id"
                  isDisabled={isSaving}
                  defaultOptions={costCenterOptions}
                  isClearable
                  placeholder="Sin centro"
                  noOptionsMessage="Sin centros de costo"
                />
                <input type="hidden" {...register('costCenterId')} />
                {errors.costCenterId ? (
                  <p className="text-xs text-red-500">
                    {errors.costCenterId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-3">
                {postingMode === 'MANUAL_ADJUSTMENT' ? (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-100">
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold">Periodo de ajuste</p>
                        <p>
                          Debes seleccionar el periodo y la fecha contable debe pertenecer a ese mismo mes.
                        </p>
                      </div>
                      <div className="max-w-sm space-y-2">
                        <AsyncSelect
                          value={
                            adjustmentPeriodOptions.find(
                              (option) => option.value === selectedRequestedPostingPeriodId,
                            ) ?? null
                          }
                          onChange={(option) =>
                            setValue('requestedPostingPeriodId', option?.value ?? '', {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          loadOptions={(inputValue) =>
                            filterOptions(adjustmentPeriodOptions, inputValue)
                          }
                          defaultOptions={adjustmentPeriodOptions}
                          isClearable={false}
                          isDisabled={isSaving}
                          instanceId="accounting-journal-entry-adjustment-period"
                          noOptionsMessage="Sin periodos de ajuste"
                        />
                        <input type="hidden" {...register('requestedPostingPeriodId')} />
                        {errors.requestedPostingPeriodId ? (
                          <p className="text-xs text-red-500">
                            {errors.requestedPostingPeriodId.message}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}

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

            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="h-full overflow-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="w-[440px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Cuenta
                      </th>
                      <th className="w-[340px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Descripción
                      </th>
                      <th className="w-[150px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Debe
                      </th>
                      <th className="w-[150px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Haber
                      </th>
                      <th className="w-[220px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Referencia
                      </th>
                      <th className="w-[96px] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
                          <td className="min-w-[440px] px-4 py-3 text-sm">
                            <AsyncSelect
                              value={
                                accountOptions.find(
                                  (option) =>
                                    option.value === watchedLines[index]?.accountId,
                                ) ?? null
                              }
                              onChange={(option) =>
                                setValue(`lines.${index}.accountId` as const, option?.value ?? '', {
                                  shouldValidate: true,
                                })
                              }
                              loadOptions={(inputValue) => filterOptions(accountOptions, inputValue)}
                              instanceId={`accounting-journal-entry-line-account-${index}`}
                              isDisabled={isSaving}
                              defaultOptions={accountOptions}
                              isClearable
                              menuPortalTarget={menuPortalTarget}
                              menuPosition="fixed"
                              placeholder="Selecciona una cuenta"
                              noOptionsMessage="Sin cuentas"
                            />
                            <input
                              type="hidden"
                              {...register(`lines.${index}.accountId` as const)}
                            />
                            {lineErrors?.accountId ? (
                              <p className="mt-1 text-xs text-red-500">
                                {lineErrors.accountId.message}
                              </p>
                            ) : null}
                          </td>
                          <td className="min-w-[340px] px-4 py-3 text-sm">
                            <input
                              type="text"
                              className="w-full min-w-[300px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.description` as const)}
                              disabled={isSaving}
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <input
                              type="text"
                              className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
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
                          <td className="px-4 py-3 text-right text-sm">
                            <input
                              type="text"
                              className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
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
                          <td className="px-4 py-3 text-sm">
                            <input
                              type="text"
                              className="w-full min-w-[180px] rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.reference` as const)}
                              disabled={isSaving}
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
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
                      ? 'text-sky-600 dark:text-sky-300'
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
