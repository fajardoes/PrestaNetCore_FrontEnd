import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, type InputHTMLAttributes, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type {
  AnticipatedInstallmentCatalogItem,
  AnticipatedInstallmentSettingsResponse,
} from '@/infrastructure/loans/responses/anticipated-installment-response'
import {
  anticipatedInstallmentSettingSchema,
  type AnticipatedInstallmentSettingValues,
} from '@/infrastructure/validations/loans/anticipated-installment.schema'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { DatePicker } from '@/presentation/share/components/date-picker'
import SelectField from '@/presentation/share/components/select'
import { anticipatedInstallmentStrategyLabel } from '@/presentation/features/loans/anticipated-installment/anticipated-installment-ui'

interface Props {
  open: boolean
  setting: AnticipatedInstallmentSettingsResponse | null
  products: LoanProductListItemDto[]
  strategies: AnticipatedInstallmentCatalogItem[]
  isSaving: boolean
  error: string | null
  onClose: () => void
  onSubmit: (values: AnticipatedInstallmentSettingValues) => void
}

const defaults: AnticipatedInstallmentSettingValues = {
  loanProductId: null,
  isGlobal: true,
  isEnabled: true,
  maxAmount: null,
  maxPercentageOfApprovedAmount: null,
  limitStrategyCode: '',
  requiresAuthorizationAboveLimit: false,
  authorizationThresholdAmount: null,
  authorizationThresholdPercentage: null,
  autoApplyRemainingAnticipatedInstallmentOnClosure: false,
  blockClosureWhenAnticipatedInstallmentPending: false,
  effectiveFrom: null,
  effectiveTo: null,
  isActive: true,
}

export const AnticipatedInstallmentSettingModal = ({
  open,
  setting,
  products,
  strategies,
  isSaving,
  error,
  onClose,
  onSubmit,
}: Props) => {
  const { register, control, watch, reset, setValue, handleSubmit, formState: { errors } } =
    useForm<AnticipatedInstallmentSettingValues>({
      resolver: yupResolver(anticipatedInstallmentSettingSchema),
      defaultValues: defaults,
    })
  const isGlobal = watch('isGlobal')
  const loanProductId = watch('loanProductId')
  const strategyCode = watch('limitStrategyCode')

  useEffect(() => {
    if (!open) return
    reset(setting ? { ...defaults, ...setting } : defaults)
  }, [open, reset, setting])

  useEffect(() => {
    if (isGlobal) setValue('loanProductId', null)
  }, [isGlobal, setValue])

  return (
    <ConfirmModal
      open={open}
      title={setting ? 'Editar regla de cuota anticipada' : 'Crear regla de cuota anticipada'}
      description="La validez y superposición de reglas es verificada por el backend."
      confirmLabel="Guardar"
      panelClassName="max-w-4xl"
      isProcessing={isSaving}
      onCancel={onClose}
      onConfirm={() => void handleSubmit(onSubmit)()}
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Checkbox label="Regla global" {...register('isGlobal')} />
        <Checkbox label="Regla habilitada" {...register('isEnabled')} />
        {!isGlobal ? (
          <Field label="Producto *" error={errors.loanProductId?.message}>
            <SelectField
              value={products.find((item) => item.id === loanProductId) ? {
                value: loanProductId ?? '',
                label: products.find((item) => item.id === loanProductId)?.name ?? '',
              } : null}
              options={products.map((item) => ({ value: item.id, label: `${item.code} - ${item.name}` }))}
              onChange={(option) => setValue('loanProductId', option?.value ?? null)}
              placeholder="Selecciona un producto"
            />
          </Field>
        ) : <div />}
        <Field label="Estrategia de límite *" error={errors.limitStrategyCode?.message}>
          <SelectField
            value={strategies.find((item) => item.code === strategyCode) ? {
              value: strategyCode,
              label: anticipatedInstallmentStrategyLabel(strategyCode, strategies.find((item) => item.code === strategyCode)?.name),
            } : null}
            options={strategies.filter((item) => item.isActive).map((item) => ({ value: item.code, label: anticipatedInstallmentStrategyLabel(item.code, item.name) }))}
            onChange={(option) => setValue('limitStrategyCode', option?.value ?? '')}
            placeholder="Selecciona una estrategia"
          />
        </Field>
        <Field label="Monto máximo" error={errors.maxAmount?.message}>
          <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...register('maxAmount')} />
        </Field>
        <Field label="% máximo del monto aprobado" error={errors.maxPercentageOfApprovedAmount?.message}>
          <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...register('maxPercentageOfApprovedAmount')} />
        </Field>
        <Checkbox label="Requiere autorización sobre límite" {...register('requiresAuthorizationAboveLimit')} />
        <div />
        <Field label="Umbral de autorización por monto" error={errors.authorizationThresholdAmount?.message}>
          <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...register('authorizationThresholdAmount')} />
        </Field>
        <Field label="Umbral de autorización por %" error={errors.authorizationThresholdPercentage?.message}>
          <input type="number" step="0.01" className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" {...register('authorizationThresholdPercentage')} />
        </Field>
        <Controller control={control} name="effectiveFrom" render={({ field }) => (
          <Field label="Vigente desde" error={errors.effectiveFrom?.message}>
            <DatePicker value={field.value ?? ''} onChange={field.onChange} allowFutureDates />
          </Field>
        )} />
        <Controller control={control} name="effectiveTo" render={({ field }) => (
          <Field label="Vigente hasta" error={errors.effectiveTo?.message}>
            <DatePicker value={field.value ?? ''} onChange={field.onChange} allowFutureDates />
          </Field>
        )} />
        <Checkbox label="Autoaplicar saldo pendiente al cierre" {...register('autoApplyRemainingAnticipatedInstallmentOnClosure')} />
        <Checkbox label="Bloquear cierre con saldo pendiente" {...register('blockClosureWhenAnticipatedInstallmentPending')} />
        {error ? <p className="md:col-span-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      </form>
    </ConfirmModal>
  )
}

const Field = ({ label, error, children }: { label: string; error?: string; children: ReactNode }) => (
  <label className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
    <span className="block font-medium">{label}</span>
    {children}
    {error ? <span className="block text-xs text-red-600 dark:text-red-300">{error}</span> : null}
  </label>
)

const Checkbox = ({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
    <input type="checkbox" {...props} />
    {label}
  </label>
)
