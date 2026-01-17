import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { DelinquencyBucketsEditor } from '@/presentation/components/loans/delinquency/DelinquencyBucketsEditor'
import {
  delinquencyPolicyFormSchema,
  type DelinquencyPolicyFormValues,
} from '@/presentation/components/loans/delinquency/delinquency-policy-form.schema'
import { useDelinquencyPolicyDetail } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-detail'
import { useDelinquencyPolicyMutations } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-mutations'
import type { CreateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy.request'
import type { UpdateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy.request'

const calculationBaseOptions = [
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'PRINCIPAL_INTEREST', label: 'Principal + Interés' },
  { value: 'OUTSTANDING_BALANCE', label: 'Saldo vencido' },
]

const roundingModeOptions = [
  { value: 'HALF_UP', label: 'Redondeo estándar' },
  { value: 'UP', label: 'Redondear hacia arriba' },
  { value: 'DOWN', label: 'Redondear hacia abajo' },
]

const normalizeOptions = (options: { value: string; label: string }[], value?: string) => {
  if (!value || options.some((option) => option.value === value)) return options
  return [{ value, label: value }, ...options]
}

const buildDefaultValues = (): DelinquencyPolicyFormValues => ({
  code: '',
  name: '',
  description: '',
  graceDays: 0,
  penaltyRateAnnual: 0,
  rateBase: 360,
  calculationBase: '',
  roundingMode: '',
  roundingDecimals: 2,
  minimumPenaltyAmount: 0,
  maximumPenaltyAmount: null,
  includeSaturday: false,
  includeSunday: false,
  buckets: [],
})

export const DelinquencyPolicyFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { data, isLoading, error, loadById, reset: resetDetail } =
    useDelinquencyPolicyDetail()
  const {
    create,
    update,
    isSaving,
    error: saveError,
    clearError,
  } = useDelinquencyPolicyMutations()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DelinquencyPolicyFormValues>({
    resolver: yupResolver(delinquencyPolicyFormSchema),
    defaultValues: buildDefaultValues(),
  })

  useEffect(() => {
    if (id) {
      void loadById(id)
      return
    }
    resetDetail()
  }, [id, loadById, resetDetail])

  useEffect(() => {
    if (!isEdit) {
      reset(buildDefaultValues())
      return
    }
    if (!data) return
    reset({
      code: data.code,
      name: data.name,
      description: data.description ?? '',
      graceDays: data.graceDays,
      penaltyRateAnnual: data.penaltyRateAnnual,
      rateBase: data.rateBase,
      calculationBase: data.calculationBase,
      roundingMode: data.roundingMode,
      roundingDecimals: data.roundingDecimals,
      minimumPenaltyAmount: data.minimumPenaltyAmount,
      maximumPenaltyAmount: data.maximumPenaltyAmount ?? null,
      includeSaturday: data.includeSaturday,
      includeSunday: data.includeSunday,
      buckets: data.buckets ?? [],
    })
  }, [data, isEdit, reset])

  const calculationOptions = useMemo(
    () => normalizeOptions(calculationBaseOptions, data?.calculationBase),
    [data?.calculationBase],
  )
  const roundingOptions = useMemo(
    () => normalizeOptions(roundingModeOptions, data?.roundingMode),
    [data?.roundingMode],
  )

  const onSubmit = handleSubmit(async (values) => {
    clearError()
    const payloadBase = {
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || null,
      maximumPenaltyAmount:
        values.maximumPenaltyAmount === null || values.maximumPenaltyAmount === undefined
          ? null
          : values.maximumPenaltyAmount,
      buckets: values.buckets ?? [],
    }

    if (isEdit && id) {
      const payload: UpdateDelinquencyPolicyRequestDto = payloadBase
      const result = await update(id, payload)
      if (result.success) {
        navigate('/loans/delinquency-policies')
      }
      return
    }

    const payload: CreateDelinquencyPolicyRequestDto = payloadBase
    const result = await create(payload)
    if (result.success) {
      navigate('/loans/delinquency-policies')
    }
  })

  if (isEdit && isLoading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando política...
      </div>
    )
  }

  if (isEdit && error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {isEdit ? 'Editar Política de Mora' : 'Nueva Política de Mora'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Configura parámetros, redondeos y buckets asociados.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit} noValidate>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Identificación
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Código
              </label>
              <input
                id="code"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('code')}
                disabled={isSaving}
              />
              {errors.code ? (
                <p className="text-xs text-red-500">{errors.code.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Nombre
              </label>
              <input
                id="name"
                type="text"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('name')}
                disabled={isSaving}
              />
              {errors.name ? (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2 md:col-span-3">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Descripción
              </label>
              <textarea
                id="description"
                className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('description')}
                disabled={isSaving}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Parámetros
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label
                htmlFor="graceDays"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Días de gracia
              </label>
              <input
                id="graceDays"
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('graceDays', { valueAsNumber: true })}
                disabled={isSaving}
              />
              {errors.graceDays ? (
                <p className="text-xs text-red-500">{errors.graceDays.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="penaltyRateAnnual"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Tasa anual
              </label>
              <input
                id="penaltyRateAnnual"
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('penaltyRateAnnual', { valueAsNumber: true })}
                disabled={isSaving}
              />
              {errors.penaltyRateAnnual ? (
                <p className="text-xs text-red-500">
                  {errors.penaltyRateAnnual.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rateBase"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Base de tasa
              </label>
              <select
                id="rateBase"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('rateBase', { valueAsNumber: true })}
                disabled={isSaving}
              >
                <option value={360}>360</option>
                <option value={365}>365</option>
              </select>
              {errors.rateBase ? (
                <p className="text-xs text-red-500">{errors.rateBase.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="calculationBase"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Base de cálculo
              </label>
              <select
                id="calculationBase"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('calculationBase')}
                disabled={isSaving}
              >
                <option value="">Selecciona una base</option>
                {calculationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.calculationBase ? (
                <p className="text-xs text-red-500">
                  {errors.calculationBase.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="roundingMode"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Modo de redondeo
              </label>
              <select
                id="roundingMode"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('roundingMode')}
                disabled={isSaving}
              >
                <option value="">Selecciona un modo</option>
                {roundingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.roundingMode ? (
                <p className="text-xs text-red-500">
                  {errors.roundingMode.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="roundingDecimals"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Decimales
              </label>
              <input
                id="roundingDecimals"
                type="number"
                min={0}
                step={1}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('roundingDecimals', { valueAsNumber: true })}
                disabled={isSaving}
              />
              {errors.roundingDecimals ? (
                <p className="text-xs text-red-500">
                  {errors.roundingDecimals.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="minimumPenaltyAmount"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Monto mínimo
              </label>
              <input
                id="minimumPenaltyAmount"
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('minimumPenaltyAmount', { valueAsNumber: true })}
                disabled={isSaving}
              />
              {errors.minimumPenaltyAmount ? (
                <p className="text-xs text-red-500">
                  {errors.minimumPenaltyAmount.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="maximumPenaltyAmount"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Monto máximo (opcional)
              </label>
              <input
                id="maximumPenaltyAmount"
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('maximumPenaltyAmount', {
                  setValueAs: (value) => (value === '' ? null : Number(value)),
                })}
                disabled={isSaving}
              />
              {errors.maximumPenaltyAmount ? (
                <p className="text-xs text-red-500">
                  {errors.maximumPenaltyAmount.message}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Fin de semana
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('includeSaturday')}
                disabled={isSaving}
              />
              Incluir sábado
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('includeSunday')}
                disabled={isSaving}
              />
              Incluir domingo
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si ambos son false, no se consideran días de fin de semana.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <DelinquencyBucketsEditor
            control={control}
            register={register}
            errors={errors}
            disabled={isSaving}
          />
        </section>

        {saveError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {saveError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={() => navigate('/loans/delinquency-policies')}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary px-6 py-2 text-sm"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
