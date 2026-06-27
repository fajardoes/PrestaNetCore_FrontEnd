import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { DelinquencyBucketsEditor } from '@/presentation/components/loans/delinquency/DelinquencyBucketsEditor'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import {
  delinquencyPolicyFormSchema,
  type DelinquencyPolicyFormValues,
} from '@/presentation/components/loans/delinquency/delinquency-policy-form.schema'
import { useDelinquencyPolicyDetail } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-detail'
import { useDelinquencyPolicyMutations } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-mutations'
import { useDelinquencyPolicyCatalogs } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-catalogs'
import type { CreateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy.request'
import type { UpdateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy.request'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

const filterOptions = <TMeta,>(
  options: AsyncSelectOption<TMeta>[],
  inputValue: string,
) => {
  const term = inputValue.trim().toLowerCase()
  if (!term) return options
  return options.filter((option) => option.label.toLowerCase().includes(term))
}

const toCatalogOption = (
  item: LoanCatalogItemDto,
): AsyncSelectOption<LoanCatalogItemDto> => ({
  value: item.id,
  label: `${item.code} - ${item.name}`,
  meta: item,
})

const ensureResolvedOption = (
  options: AsyncSelectOption<LoanCatalogItemDto>[],
  id?: string | null,
  code?: string | null,
  name?: string | null,
) => {
  if (!id || options.some((option) => option.value === id)) return options
  const label = code && name ? `${code} - ${name}` : name || code || id
  return [{ value: id, label }, ...options]
}

const buildDefaultValues = (): DelinquencyPolicyFormValues => ({
  code: '',
  name: '',
  description: '',
  graceDays: 0,
  penaltyRateAnnual: 0,
  rateBaseId: '',
  calculationBaseId: '',
  roundingModeId: '',
  roundingDecimals: 2,
  minimumPenaltyAmount: null,
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
    rateBases,
    calculationBases,
    roundingModes,
    isLoading: isLoadingCatalogs,
    error: catalogsError,
  } = useDelinquencyPolicyCatalogs()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
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
      rateBaseId: data.rateBaseId ?? '',
      calculationBaseId: data.calculationBaseId ?? '',
      roundingModeId: data.roundingModeId ?? '',
      roundingDecimals: data.roundingDecimals,
      minimumPenaltyAmount: data.minimumPenaltyAmount ?? null,
      maximumPenaltyAmount: data.maximumPenaltyAmount ?? null,
      includeSaturday: data.includeSaturday,
      includeSunday: data.includeSunday,
      buckets: data.buckets ?? [],
    })
  }, [data, isEdit, reset])

  const rateBaseId = watch('rateBaseId')
  const calculationBaseId = watch('calculationBaseId')
  const roundingModeId = watch('roundingModeId')
  const rateBaseAsyncOptions = useMemo(
    () =>
      ensureResolvedOption(
        rateBases.map(toCatalogOption),
        data?.rateBaseId,
        data?.rateBaseCode ?? String(data?.rateBase ?? ''),
        data?.rateBaseName,
      ),
    [data?.rateBase, data?.rateBaseCode, data?.rateBaseId, data?.rateBaseName, rateBases],
  )
  const calculationAsyncOptions = useMemo(
    () =>
      ensureResolvedOption(
        calculationBases.map(toCatalogOption),
        data?.calculationBaseId,
        data?.calculationBaseCode ?? data?.calculationBase,
        data?.calculationBaseName,
      ),
    [
      calculationBases,
      data?.calculationBase,
      data?.calculationBaseCode,
      data?.calculationBaseId,
      data?.calculationBaseName,
    ],
  )
  const roundingAsyncOptions = useMemo(
    () =>
      ensureResolvedOption(
        roundingModes.map(toCatalogOption),
        data?.roundingModeId,
        data?.roundingModeCode ?? data?.roundingMode,
        data?.roundingModeName,
      ),
    [
      data?.roundingMode,
      data?.roundingModeCode,
      data?.roundingModeId,
      data?.roundingModeName,
      roundingModes,
    ],
  )

  const onSubmit = handleSubmit(async (values) => {
    clearError()
    const payloadBase = {
      ...values,
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || null,
      minimumPenaltyAmount:
        values.minimumPenaltyAmount === null ||
        values.minimumPenaltyAmount === undefined
          ? null
          : values.minimumPenaltyAmount,
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
        {catalogsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {catalogsError}
          </div>
        ) : null}

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
                Tasa moratoria anual
              </label>
              <input
                id="penaltyRateAnnual"
                type="number"
                min={0}
                step="0.0001"
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
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  rateBaseAsyncOptions.find((option) => option.value === rateBaseId) ??
                  null
                }
                onChange={(option) =>
                  setValue('rateBaseId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(rateBaseAsyncOptions, inputValue))
                }
                placeholder="Selecciona base"
                inputId="rateBase"
                instanceId="delinquency-policy-rate-base"
                isDisabled={isSaving || isLoadingCatalogs}
                defaultOptions={rateBaseAsyncOptions}
                noOptionsMessage="Sin bases"
              />
              <input type="hidden" {...register('rateBaseId')} />
              {errors.rateBaseId ? (
                <p className="text-xs text-red-500">{errors.rateBaseId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="calculationBase"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Base de cálculo
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  calculationAsyncOptions.find((option) => option.value === calculationBaseId) ??
                  null
                }
                onChange={(option) =>
                  setValue('calculationBaseId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(calculationAsyncOptions, inputValue))
                }
                placeholder="Selecciona una base"
                inputId="calculationBase"
                instanceId="delinquency-policy-calculation-base"
                isDisabled={isSaving || isLoadingCatalogs}
                defaultOptions={calculationAsyncOptions}
                noOptionsMessage="Sin bases de cálculo"
              />
              <input type="hidden" {...register('calculationBaseId')} />
              {errors.calculationBaseId ? (
                <p className="text-xs text-red-500">
                  {errors.calculationBaseId.message}
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
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  roundingAsyncOptions.find((option) => option.value === roundingModeId) ?? null
                }
                onChange={(option) =>
                  setValue('roundingModeId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(roundingAsyncOptions, inputValue))
                }
                placeholder="Selecciona un modo"
                inputId="roundingMode"
                instanceId="delinquency-policy-rounding-mode"
                isDisabled={isSaving || isLoadingCatalogs}
                defaultOptions={roundingAsyncOptions}
                noOptionsMessage="Sin modos de redondeo"
              />
              <input type="hidden" {...register('roundingModeId')} />
              {errors.roundingModeId ? (
                <p className="text-xs text-red-500">
                  {errors.roundingModeId.message}
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
                Mínimo de mora (opcional)
              </label>
              <input
                id="minimumPenaltyAmount"
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('minimumPenaltyAmount', {
                  setValueAs: (value) => (value === '' ? null : Number(value)),
                })}
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
                Máximo de mora (opcional)
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
