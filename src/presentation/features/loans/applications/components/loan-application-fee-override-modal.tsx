import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'
import {
  loanApplicationFeeOverrideSchema,
  type LoanApplicationFeeOverrideFormValues,
} from '@/infrastructure/validations/loans/loan-application-fee-override.schema'
import {
  formatChargeRateOrValue,
  formatCurrency,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationFeeOverrideModalProps {
  open: boolean
  fee: LoanApplicationFeeResponse | null
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: LoanApplicationFeeOverrideFormValues) => Promise<void> | void
}

const resolveDefaultValues = (
  fee: LoanApplicationFeeResponse | null,
): LoanApplicationFeeOverrideFormValues => {
  if (!fee) {
    return {
      mode: 'INHERIT',
      overrideValue: null,
      overrideReason: '',
    }
  }

  const normalizedMode = (fee.overrideMode ?? '').trim().toUpperCase()
  return {
    mode:
      fee.isRemoved || normalizedMode === 'REMOVED'
        ? 'REMOVED'
        : normalizedMode === 'MODIFIED'
          ? 'MODIFIED'
          : 'INHERIT',
    overrideValue: fee.overrideValue ?? fee.effectiveValue ?? fee.productValue ?? null,
    overrideReason: fee.overrideReason ?? '',
  }
}

export const LoanApplicationFeeOverrideModal = ({
  open,
  fee,
  isSubmitting = false,
  onClose,
  onSubmit,
}: LoanApplicationFeeOverrideModalProps) => {
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<LoanApplicationFeeOverrideFormValues>({
    resolver: yupResolver(loanApplicationFeeOverrideSchema),
    defaultValues: resolveDefaultValues(fee),
  })

  const mode = watch('mode')

  useEffect(() => {
    reset(resolveDefaultValues(fee))
  }, [fee, reset])

  if (!open || !fee) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Ajustar comisión de desembolso
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Define si la comisión se hereda del producto, se modifica o se remueve para esta
            solicitud.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60 md:grid-cols-2">
          <Info label="Comisión" value={fee.feeTypeName} />
          <Info label="Base de cobro" value={fee.chargeBaseName} />
          <Info
            label="Valor producto"
            value={formatChargeRateOrValue(fee.productValue, fee.valueTypeCode)}
          />
          <Info label="Monto calculado producto" value={formatCurrency(fee.productCalculatedAmount)} />
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <Controller
            name="mode"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <ModeCard
                  title="Heredar"
                  description="Usa el valor configurado en el producto."
                  active={field.value === 'INHERIT'}
                  onClick={() => field.onChange('INHERIT')}
                />
                <ModeCard
                  title="Modificar"
                  description="Reemplaza el valor efectivo para esta solicitud."
                  active={field.value === 'MODIFIED'}
                  onClick={() => field.onChange('MODIFIED')}
                />
                <ModeCard
                  title="Remover"
                  description="Excluye esta comisión del desembolso."
                  active={field.value === 'REMOVED'}
                  onClick={() => field.onChange('REMOVED')}
                />
              </div>
            )}
          />

          {mode === 'MODIFIED' ? (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Nuevo valor
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                {...register('overrideValue')}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Usa porcentaje o monto fijo según el tipo de valor de la comisión.
              </p>
              {errors.overrideValue ? (
                <p className="text-xs text-red-600 dark:text-red-300">
                  {errors.overrideValue.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Motivo {(mode === 'MODIFIED' || mode === 'REMOVED') ? '*' : '(opcional)'}
            </label>
            <textarea
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('overrideReason')}
            />
            {errors.overrideReason ? (
              <p className="text-xs text-red-600 dark:text-red-300">
                {errors.overrideReason.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

interface ModeCardProps {
  title: string
  description: string
  active: boolean
  onClick: () => void
}

const ModeCard = ({ title, description, active, onClick }: ModeCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border px-4 py-3 text-left transition ${
      active
        ? 'border-primary bg-primary/10 text-slate-900 ring-2 ring-primary/20 dark:border-primary dark:bg-primary/15 dark:text-slate-50'
        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-700'
    }`}
  >
    <p className="text-sm font-semibold">{title}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
  </button>
)
