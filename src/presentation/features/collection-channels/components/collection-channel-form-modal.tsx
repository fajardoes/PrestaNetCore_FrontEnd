import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  collectionChannelSchema,
  type CollectionChannelFormValues,
} from '@/infrastructure/validations/collection-channels/collection-channel.schema'
import type { CollectionChannelResponse } from '@/infrastructure/collection-channels/responses/collection-channel-response'
import type { CollectionChannelTypeResponse } from '@/infrastructure/collection-channels/responses/collection-channel-type-response'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'
import { formatChannelMoney } from './collection-channel-ui'

interface CollectionChannelFormModalProps {
  open: boolean
  channel?: CollectionChannelResponse | null
  channelTypes: CollectionChannelTypeResponse[]
  isSaving: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: CollectionChannelFormValues) => Promise<void> | void
}

const defaultValues = {
  code: '',
  name: '',
  channelTypeCode: '',
  currencyCode: 'HNL',
  maxSinglePaymentAmount: undefined,
  maxDailyAmount: undefined,
  maxOutstandingAmount: undefined,
  notes: '',
} as const

export const CollectionChannelFormModal = ({
  open,
  channel,
  channelTypes,
  isSaving,
  error,
  onClose,
  onSubmit,
}: CollectionChannelFormModalProps) => {
  const isEditMode = Boolean(channel)
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CollectionChannelFormValues>({
    resolver: zodResolver(collectionChannelSchema),
    defaultValues,
  })

  const selectedChannelTypeCode = watch('channelTypeCode')
  const [selectedChannelType, setSelectedChannelType] = useState<{
    code: string
    name: string
  } | null>(null)

  useEffect(() => {
    if (!open) return
    if (channel) {
      reset({
        code: channel.code,
        name: channel.name,
        channelTypeCode: channel.channelTypeCode,
        currencyCode: 'HNL',
        maxSinglePaymentAmount: channel.maxSinglePaymentAmount,
        maxDailyAmount: channel.maxDailyAmount,
        maxOutstandingAmount: channel.maxOutstandingAmount,
        notes: channel.notes ?? '',
      })
      return
    }
    reset(defaultValues)
  }, [channel, open, reset])

  const selectableChannelTypes = useMemo(() => {
    const values = new Map(channelTypes.map((item) => [item.code, item]))
    if (channel && !values.has(channel.channelTypeCode)) {
      values.set(channel.channelTypeCode, {
        id: `inactive-${channel.channelTypeCode}`,
        code: channel.channelTypeCode,
        name: channel.channelTypeCode,
        description: null,
        sortOrder: Number.MAX_SAFE_INTEGER,
        isActive: false,
      })
    }
    return Array.from(values.values())
  }, [channel, channelTypes])

  const channelTypeOptions = useMemo<SelectOption[]>(
    () =>
      selectableChannelTypes.map((item) => ({
        value: item.code,
        label: `${item.name} (${item.code})${!item.isActive ? ' - Inactivo' : ''}`,
      })),
    [selectableChannelTypes],
  )

  useEffect(() => {
    const found = selectableChannelTypes.find((item) => item.code === selectedChannelTypeCode)
    if (!found) {
      setSelectedChannelType(null)
      return
    }
    setSelectedChannelType({
      code: found.code,
      name: found.name,
    })
  }, [selectableChannelTypes, selectedChannelTypeCode])

  if (!open) return null

  const currencyCode = 'HNL'
  const maxSinglePaymentAmount = watch('maxSinglePaymentAmount')
  const maxDailyAmount = watch('maxDailyAmount')
  const maxOutstandingAmount = watch('maxOutstandingAmount')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {channel ? 'Editar canal' : 'Nuevo canal'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isEditMode
                ? 'Configura el canal operativo y sus límites de saldo pendiente.'
                : 'Configura el canal operativo y sus límites transaccionales y de saldo pendiente.'}
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit({ ...values, currencyCode: 'HNL' })
          })}
          noValidate
        >
          <input type="hidden" value="HNL" {...register('currencyCode')} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              id="code"
              label="Código"
              error={errors.code?.message}
              disabled={isSaving}
              register={register('code')}
              placeholder="p. ej. C-001"
            />
            <InputField
              id="name"
              label="Nombre"
              error={errors.name?.message}
              disabled={isSaving}
              register={register('name')}
              placeholder="p. ej. Caja central"
            />
            <StaticField
              label="Moneda"
              value="HNL"
              helper="Moneda fija informativa para este módulo."
            />
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="channelTypeCode"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tipo de canal
              </label>
              <Controller
                control={control}
                name="channelTypeCode"
                render={({ field }) => (
                  <SelectField
                    inputId="channelTypeCode"
                    instanceId="collection-channel-type-code"
                    value={channelTypeOptions.find((item) => item.value === field.value) ?? null}
                    onChange={(option) => field.onChange(option?.value ?? '')}
                    options={channelTypeOptions}
                    placeholder="Selecciona un tipo"
                    isDisabled={isSaving}
                    isClearable
                    noOptionsMessage="Sin tipos de canal"
                  />
                )}
              />
              {selectedChannelType ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Seleccionado: <span className="font-medium">{selectedChannelType.name}</span>{' '}
                  <span className="font-mono">({selectedChannelType.code})</span>
                </p>
              ) : null}
              {errors.channelTypeCode ? (
                <p className="text-xs text-red-500">{errors.channelTypeCode.message}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Límites operativos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditMode
                  ? 'Estos valores funcionan como controles de riesgo operativo y saldo pendiente.'
                  : 'Estos valores funcionan como controles de riesgo operativo, incluyendo el límite máximo de saldo pendiente del canal.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <MoneyField
                id="maxSinglePaymentAmount"
                label="Límite por pago"
                error={errors.maxSinglePaymentAmount?.message}
                disabled={isSaving}
                register={register('maxSinglePaymentAmount', { valueAsNumber: true })}
                preview={formatChannelMoney(maxSinglePaymentAmount, currencyCode)}
              />
              <MoneyField
                id="maxDailyAmount"
                label="Límite diario"
                error={errors.maxDailyAmount?.message}
                disabled={isSaving}
                register={register('maxDailyAmount', { valueAsNumber: true })}
                preview={formatChannelMoney(maxDailyAmount, currencyCode)}
              />
              <MoneyField
                id="maxOutstandingAmount"
                label="Límite máximo de saldo pendiente"
                error={errors.maxOutstandingAmount?.message}
                disabled={isSaving}
                register={register('maxOutstandingAmount', { valueAsNumber: true })}
                preview={formatChannelMoney(maxOutstandingAmount, currencyCode)}
              />
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
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              placeholder="Describe consideraciones operativas o financieras del canal."
              disabled={isSaving}
              {...register('notes')}
            />
            {errors.notes ? (
              <p className="text-xs text-red-500">{errors.notes.message}</p>
            ) : null}
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
              className="btn-secondary px-4 py-2 text-sm"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : channel ? 'Guardar cambios' : 'Crear canal'}
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

const MoneyField = ({
  id,
  label,
  error,
  disabled,
  register,
  preview,
}: {
  id: string
  label: string
  error?: string
  disabled?: boolean
  register: UseFormRegisterReturn
  preview: string
}) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="block min-h-[2.5rem] text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {label}
    </label>
    <input
      id={id}
      type="number"
      min="0"
      step="0.01"
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
      disabled={disabled}
      {...register}
    />
    <p className="text-xs text-slate-500 dark:text-slate-400">Vista previa: {preview}</p>
    {error ? <p className="text-xs text-red-500">{error}</p> : null}
  </div>
)

const StaticField = ({
  label,
  value,
  helper,
}: {
  label: string
  value: string
  helper?: string
}) => (
  <div className="space-y-2">
    <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
    <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      {value}
    </div>
    {helper ? <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p> : null}
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
