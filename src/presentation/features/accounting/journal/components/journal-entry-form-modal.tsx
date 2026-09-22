import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import type { ChangeEvent, KeyboardEvent } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { JournalEntryFormValues } from '@/infrastructure/validations/accounting/journal-entry.schema'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { TableActionButton } from '@/presentation/share/components/table-action-button'
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import { formatAccountingDate, getPeriodLabel } from '@/presentation/features/accounting/accounting-ui'
import { Copy, Eraser } from 'lucide-react'

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
    meta: { selectable: true },
  }))
  const lineCostCenterOptions: Array<AsyncSelectOption<{ selectable: boolean }>> = [
    ...costCenterOptions,
    ...watchedLines.flatMap((line) => {
      if (!line?.costCenterId) return []
      return [{
        value: line.costCenterId,
        label: line.costCenterCode || line.costCenterName
          ? `${line.costCenterCode ?? ''}${line.costCenterCode && line.costCenterName ? ' - ' : ''}${line.costCenterName ?? ''} (histórico)`
          : 'Centro histórico (metadata no disponible)',
        meta: { selectable: false },
      }]
    }),
  ].filter((option, index, options) =>
    options.findIndex((candidate) => candidate.value === option.value) === index,
  )
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

  const clearLine = (lineIndex: number) => {
    setValue(`lines.${lineIndex}.accountId` as const, '', {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue(`lines.${lineIndex}.description` as const, '', {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue(`lines.${lineIndex}.debit` as const, 0, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue(`lines.${lineIndex}.credit` as const, 0, {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue(`lines.${lineIndex}.reference` as const, '', {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue(`lines.${lineIndex}.costCenterId` as const, null, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  const duplicateLine = (lineIndex: number) => {
    const line = watchedLines[lineIndex]
    append({
      accountId: line?.accountId ?? '',
      description: line?.description ?? '',
      debit: Number(line?.debit) || 0,
      credit: Number(line?.credit) || 0,
      reference: line?.reference ?? '',
      costCenterId: line?.costCenterId ?? null,
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-2 backdrop-blur sm:p-4">
      <div className="flex h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] w-full max-w-[96rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950 sm:h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2rem)]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {isEdit ? 'Editar asiento contable' : 'Nuevo asiento contable'}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
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
          <div className="m-5 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Cargando información del asiento...
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900 dark:border-sky-900/50 dark:bg-sky-500/10 dark:text-sky-100">
                  <span>
                    <span className="font-semibold">Fecha de negocio:</span>{' '}
                    {formatAccountingDate(businessDate)}
                  </span>
                  <span>
                    <span className="font-semibold">Periodo operativo resuelto:</span>{' '}
                    {operationalPeriodLabel || '—'}
                  </span>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Cabecera del asiento
                    </h4>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      Define el contexto del asiento antes de capturar sus líneas.
                    </p>
                  </div>
                  <div className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-3">
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
                  Aplicar centro a todas las líneas
                </label>
                <AsyncSelect
                  value={
                    costCenterOptions.find((option) => option.value === selectedCostCenterId) ??
                    null
                  }
                  onChange={(option) => {
                    const nextCostCenterId = option?.value ?? null
                    setValue('costCenterId', nextCostCenterId ?? '', {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                    watchedLines.forEach((_, lineIndex) => {
                      setValue(`lines.${lineIndex}.costCenterId` as const, nextCostCenterId, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    })
                  }}
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
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Solo modifica las líneas actuales; las nuevas líneas comienzan sin centro. Un borrador histórico con centro solo en cabecera debe corregirse en las líneas.
                </p>
                {errors.costCenterId ? (
                  <p className="text-xs text-red-500">
                    {errors.costCenterId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
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

                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Líneas del asiento
                      </h4>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Captura cuentas, importes y distribución de cada movimiento.
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {fields.length} {fields.length === 1 ? 'línea' : 'líneas'}
                    </span>
                  </div>
                  <div className="max-h-[45vh] overflow-auto">
                <table className="min-w-[1120px] w-full table-fixed divide-y divide-slate-200 dark:divide-slate-800">
                  <colgroup>
                    <col className="w-[30%]" />
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[11%]" />
                    <col className="w-[16%]" />
                    <col className="w-[8%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur dark:bg-slate-900/95">
                    <tr>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Cuenta
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Descripción
                      </th>
                      <th className="px-2 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Debe (débito)
                      </th>
                      <th className="px-2 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Haber (crédito)
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Referencia
                      </th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Centro de costo
                      </th>
                      <th className="px-1 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Acciones
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
                          <td className="min-w-[320px] px-3 py-1 align-top text-sm">
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
                          <td className="min-w-[200px] px-3 py-1 align-top text-sm">
                            <input
                              type="text"
                              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.description` as const)}
                              disabled={isSaving}
                            />
                          </td>
                          <td className="px-2 py-1 align-top text-right text-sm">
                            <input
                              type="text"
                              className="w-full min-w-[96px] rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
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
                          <td className="px-2 py-1 align-top text-right text-sm">
                            <input
                              type="text"
                              className="w-full min-w-[96px] rounded-md border border-slate-300 bg-white px-2 py-1 text-right text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
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
                          <td className="min-w-[150px] px-3 py-1 align-top text-sm">
                            <input
                              type="text"
                              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                              {...register(`lines.${index}.reference` as const)}
                              disabled={isSaving}
                            />
                          </td>
                          <td className="min-w-[190px] px-3 py-1 align-top text-sm">
                            <AsyncSelect<{ selectable: boolean }>
                              value={
                                lineCostCenterOptions.find(
                                  (option) => option.value === watchedLines[index]?.costCenterId,
                                ) ?? null
                              }
                              onChange={(option) =>
                                setValue(
                                  `lines.${index}.costCenterId` as const,
                                  option?.value ?? null,
                                  { shouldValidate: true, shouldDirty: true },
                                )
                              }
                              loadOptions={(inputValue) =>
                                filterOptions(lineCostCenterOptions, inputValue)
                              }
                              isOptionDisabled={(option) => option.meta?.selectable === false}
                              instanceId={`accounting-journal-entry-line-cost-center-${index}`}
                              isDisabled={isSaving}
                              defaultOptions={lineCostCenterOptions}
                              isClearable
                              menuPortalTarget={menuPortalTarget}
                              menuPosition="fixed"
                              placeholder="Sin centro"
                              noOptionsMessage="Sin centros de costo"
                            />
                            <input
                              type="hidden"
                              {...register(`lines.${index}.costCenterId` as const)}
                            />
                          </td>
                          <td className="px-1 py-1 align-top text-right text-sm">
                            <div className="flex items-center justify-start gap-0.5">
                              <button
                                type="button"
                                onClick={() => duplicateLine(index)}
                                className="btn-table-action !h-6 !w-6 !px-0"
                                aria-label="Duplicar línea"
                                title="Duplicar línea"
                                disabled={isSaving}
                              >
                                <Copy className="h-3 w-3" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                onClick={() => clearLine(index)}
                                className="btn-table-action !h-6 !w-6 !px-0"
                                aria-label="Limpiar línea"
                                title="Limpiar línea"
                                disabled={isSaving}
                              >
                                <Eraser className="h-3 w-3" aria-hidden="true" />
                              </button>
                              <TableActionButton
                                icon="delete"
                                label="Eliminar línea"
                                onClick={() => remove(index)}
                                className="!h-6 !w-6 !px-0"
                                disabled={isSaving || fields.length === 1}
                              />
                            </div>
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
            </section>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-1 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  append({
                    accountId: '',
                    description: '',
                    debit: 0,
                    credit: 0,
                    reference: '',
                    costCenterId: null,
                  })
                }
                className="inline-flex items-center rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-primary/50 dark:bg-primary/10 dark:text-sky-300 dark:hover:bg-primary/20"
                disabled={isSaving}
              >
                + Agregar línea
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Usa duplicar para repetir una línea con sus valores actuales.
              </span>
            </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
              {diff !== 0 ? (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200">
                  El asiento está desbalanceado. Revisa los montos antes de guardar.
                </div>
              ) : null}

              {error ? (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <span className="mr-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Debe (débito)</span>
                    <strong className="text-slate-900 dark:text-slate-100">{formatAmount(totals.debit)}</strong>
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <span className="mr-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Haber (crédito)</span>
                    <strong className="text-slate-900 dark:text-slate-100">{formatAmount(totals.credit)}</strong>
                  </span>
                  <span
                    aria-live="polite"
                    className={
                      diff === 0
                        ? 'rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-200'
                        : 'rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200'
                    }
                  >
                    <span className="mr-1 text-xs uppercase tracking-wide">Diferencia</span>
                    <strong>{formatAmount(Math.abs(diff))}</strong>
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary px-4 py-2"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary px-6 py-2 text-sm shadow-sm shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar borrador'}
              </button>
                </div>
              </div>
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

