import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import {
  loanProductFormSchema,
  type LoanProductFormValues,
} from '@/presentation/features/loans/products/components/loan-product-form.schema'
import { FeesEditor } from '@/presentation/features/loans/products/components/fees-editor'
import { InsurancesEditor } from '@/presentation/features/loans/products/components/insurances-editor'
import { CollateralRulesEditor } from '@/presentation/features/loans/products/components/collateral-rules-editor'
import { GlAccountsSelector } from '@/presentation/features/loans/products/components/gl-accounts-selector'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface LoanCatalogOptions {
  termUnits: LoanCatalogItemDto[]
  interestRateTypes: LoanCatalogItemDto[]
  rateBases: LoanCatalogItemDto[]
  amortizationMethods: LoanCatalogItemDto[]
  paymentFrequencies: LoanCatalogItemDto[]
  portfolioTypes: LoanCatalogItemDto[]
  feeTypes: LoanCatalogItemDto[]
  feeChargeBases: LoanCatalogItemDto[]
  feeValueTypes: LoanCatalogItemDto[]
  feeChargeTimings: LoanCatalogItemDto[]
  insuranceTypes: LoanCatalogItemDto[]
  insuranceCalculationBases: LoanCatalogItemDto[]
  insuranceCoveragePeriods: LoanCatalogItemDto[]
  insuranceChargeTimings: LoanCatalogItemDto[]
  collateralTypes: LoanCatalogItemDto[]
}

interface LoanProductFormProps {
  initialValues?: Partial<LoanProductFormValues>
  onSubmit: (values: LoanProductFormValues) => Promise<void> | void
  onCancel: () => void
  isSaving?: boolean
  error?: string | null
  isEdit?: boolean
  onSearchAccounts: (query: string) => Promise<ChartAccountListItem[]>
  onResolveAccount?: (accountId: string) => Promise<ChartAccountListItem | null>
  isSearchingAccounts?: boolean
  accountsError?: string | null
  catalogs: LoanCatalogOptions
  isLoadingCatalogs?: boolean
  catalogsError?: string | null
}

const defaultValues: LoanProductFormValues = {
  code: '',
  name: '',
  description: '',
  isActive: true,
  currencyCode: 'HNL',
  minAmount: 0,
  maxAmount: 0,
  minTerm: 1,
  maxTerm: 1,
  termUnitId: '',
  interestRateTypeId: '',
  nominalRate: 0,
  rateBaseId: '',
  amortizationMethodId: '',
  paymentFrequencyId: '',
  gracePrincipal: 0,
  graceInterest: 0,
  requiresCollateral: false,
  minCollateralRatio: null,
  hasInsurance: false,
  portfolioTypeId: '',
  glLoanPortfolioAccountId: '',
  glInterestIncomeAccountId: '',
  glInterestSuspenseAccountId: null,
  glFeeIncomeAccountId: null,
  glInsurancePayableAccountId: null,
  fees: [],
  insurances: [],
  collateralRules: [],
}

const toNumberValue = (value: string) => (value === '' ? undefined : Number(value))
const toOptionalNumber = (value: string) => (value === '' ? null : Number(value))
const toOptionalText = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`
const filterOptions = (
  options: AsyncSelectOption<LoanCatalogItemDto>[],
  inputValue: string,
) => {
  const term = inputValue.trim().toLowerCase()
  if (!term) return options
  return options.filter((option) => option.label.toLowerCase().includes(term))
}

export const LoanProductForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  error,
  isEdit = false,
  onSearchAccounts,
  onResolveAccount,
  isSearchingAccounts,
  accountsError,
  catalogs,
  isLoadingCatalogs,
  catalogsError,
}: LoanProductFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LoanProductFormValues>({
    resolver: yupResolver(loanProductFormSchema),
    defaultValues,
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        ...defaultValues,
        ...initialValues,
        currencyCode: 'HNL',
      })
    } else {
      reset(defaultValues)
    }
  }, [initialValues, reset])

  const requiresCollateral = useWatch({ control, name: 'requiresCollateral' })
  const hasInsurance = useWatch({ control, name: 'hasInsurance' })
  const insurances = useWatch({ control, name: 'insurances' })
  const termUnitId = useWatch({ control, name: 'termUnitId' })
  const interestRateTypeId = useWatch({ control, name: 'interestRateTypeId' })
  const rateBaseId = useWatch({ control, name: 'rateBaseId' })
  const amortizationMethodId = useWatch({ control, name: 'amortizationMethodId' })
  const paymentFrequencyId = useWatch({ control, name: 'paymentFrequencyId' })
  const portfolioTypeId = useWatch({ control, name: 'portfolioTypeId' })
  const selectedTermUnit = catalogs.termUnits.find((item) => item.id === termUnitId)
  const termUnitLabel = selectedTermUnit?.name ?? 'unidad'
  const termUnitOptions = useMemo(
    () =>
      catalogs.termUnits.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [catalogs.termUnits],
  )
  const interestRateTypeOptions = useMemo(
    () =>
      catalogs.interestRateTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [catalogs.interestRateTypes],
  )
  const rateBaseOptions = useMemo(
    () =>
      catalogs.rateBases.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [catalogs.rateBases],
  )
  const amortizationMethodOptions = useMemo(
    () =>
      catalogs.amortizationMethods.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [catalogs.amortizationMethods],
  )
  const paymentFrequencyOptions = useMemo(
    () =>
      catalogs.paymentFrequencies.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [catalogs.paymentFrequencies],
  )
  const portfolioTypeOptions = useMemo(
    () =>
      catalogs.portfolioTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [catalogs.portfolioTypes],
  )

  useEffect(() => {
    if (!requiresCollateral) {
      setValue('minCollateralRatio', null)
    }
  }, [requiresCollateral, setValue])

  const submitHandler = handleSubmit((values) => {
    const normalized: LoanProductFormValues = {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: toOptionalText(values.description),
      currencyCode: 'HNL',
      termUnitId: values.termUnitId.trim(),
      interestRateTypeId: values.interestRateTypeId.trim(),
      rateBaseId: values.rateBaseId.trim(),
      amortizationMethodId: values.amortizationMethodId.trim(),
      paymentFrequencyId: values.paymentFrequencyId.trim(),
      portfolioTypeId: values.portfolioTypeId.trim(),
      glLoanPortfolioAccountId: values.glLoanPortfolioAccountId.trim(),
      glInterestIncomeAccountId: values.glInterestIncomeAccountId.trim(),
      glInterestSuspenseAccountId: toOptionalText(values.glInterestSuspenseAccountId),
      glFeeIncomeAccountId: toOptionalText(values.glFeeIncomeAccountId),
      glInsurancePayableAccountId: toOptionalText(values.glInsurancePayableAccountId),
      minCollateralRatio: values.requiresCollateral
        ? values.minCollateralRatio
        : null,
    }
    void onSubmit(normalized)
  })

  return (
    <form className="space-y-4" onSubmit={submitHandler} noValidate>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {catalogsError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-100">
          {catalogsError}
        </div>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Datos generales
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Código
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('code')}
              disabled={isSaving}
            />
            {errors.code ? (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Nombre
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('name')}
              disabled={isSaving}
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Descripción
            </label>
            <textarea
              className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('description')}
              disabled={isSaving}
            />
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40 dark:border-slate-700"
                {...register('isActive')}
                disabled={isSaving}
              />
              Activo
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Condiciones
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Moneda
            </label>
            <input type="hidden" {...register('currencyCode')} />
            <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              HNL
            </div>
            {errors.currencyCode ? (
              <p className="text-xs text-red-500">{errors.currencyCode.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Monto mínimo
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('minAmount', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.minAmount ? (
              <p className="text-xs text-red-500">{errors.minAmount.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Monto máximo
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('maxAmount', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.maxAmount ? (
              <p className="text-xs text-red-500">{errors.maxAmount.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Unidad de plazo
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={termUnitOptions.find((option) => option.value === termUnitId) ?? null}
              onChange={(option) =>
                setValue('termUnitId', option?.value ?? '', { shouldValidate: true })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(termUnitOptions, inputValue))
              }
              placeholder="Selecciona una unidad"
              inputId="termUnitId"
              instanceId="loan-product-term-unit-id"
              isDisabled={isSaving || isLoadingCatalogs}
              defaultOptions={termUnitOptions}
              noOptionsMessage="Sin unidades"
            />
            <input type="hidden" {...register('termUnitId')} />
            {errors.termUnitId ? (
              <p className="text-xs text-red-500">{errors.termUnitId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Plazo mínimo (en {termUnitLabel})
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('minTerm', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unidad: {termUnitLabel}
            </p>
            {errors.minTerm ? (
              <p className="text-xs text-red-500">{errors.minTerm.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Plazo máximo (en {termUnitLabel})
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('maxTerm', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unidad: {termUnitLabel}
            </p>
            {errors.maxTerm ? (
              <p className="text-xs text-red-500">{errors.maxTerm.message}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Interés y amortización
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tipo de tasa
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={
                interestRateTypeOptions.find((option) => option.value === interestRateTypeId) ??
                null
              }
              onChange={(option) =>
                setValue('interestRateTypeId', option?.value ?? '', {
                  shouldValidate: true,
                })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(interestRateTypeOptions, inputValue))
              }
              placeholder="Selecciona un tipo"
              inputId="interestRateTypeId"
              instanceId="loan-product-interest-rate-type-id"
              isDisabled={isSaving || isLoadingCatalogs}
              defaultOptions={interestRateTypeOptions}
              noOptionsMessage="Sin tipos de tasa"
            />
            <input type="hidden" {...register('interestRateTypeId')} />
            {errors.interestRateTypeId ? (
              <p className="text-xs text-red-500">
                {errors.interestRateTypeId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tasa nominal (% anual)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('nominalRate', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.nominalRate ? (
              <p className="text-xs text-red-500">{errors.nominalRate.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Base de tasa
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={rateBaseOptions.find((option) => option.value === rateBaseId) ?? null}
              onChange={(option) =>
                setValue('rateBaseId', option?.value ?? '', { shouldValidate: true })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(rateBaseOptions, inputValue))
              }
              placeholder="Selecciona una base"
              inputId="rateBaseId"
              instanceId="loan-product-rate-base-id"
              isDisabled={isSaving || isLoadingCatalogs}
              defaultOptions={rateBaseOptions}
              noOptionsMessage="Sin bases de tasa"
            />
            <input type="hidden" {...register('rateBaseId')} />
            {errors.rateBaseId ? (
              <p className="text-xs text-red-500">{errors.rateBaseId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Método amortización
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={
                amortizationMethodOptions.find(
                  (option) => option.value === amortizationMethodId,
                ) ?? null
              }
              onChange={(option) =>
                setValue('amortizationMethodId', option?.value ?? '', {
                  shouldValidate: true,
                })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(amortizationMethodOptions, inputValue))
              }
              placeholder="Selecciona un método"
              inputId="amortizationMethodId"
              instanceId="loan-product-amortization-method-id"
              isDisabled={isSaving || isLoadingCatalogs}
              defaultOptions={amortizationMethodOptions}
              noOptionsMessage="Sin métodos de amortización"
            />
            <input type="hidden" {...register('amortizationMethodId')} />
            {errors.amortizationMethodId ? (
              <p className="text-xs text-red-500">
                {errors.amortizationMethodId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Frecuencia de pago
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={
                paymentFrequencyOptions.find((option) => option.value === paymentFrequencyId) ??
                null
              }
              onChange={(option) =>
                setValue('paymentFrequencyId', option?.value ?? '', {
                  shouldValidate: true,
                })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(paymentFrequencyOptions, inputValue))
              }
              placeholder="Selecciona una frecuencia"
              inputId="paymentFrequencyId"
              instanceId="loan-product-payment-frequency-id"
              isDisabled={isSaving || isLoadingCatalogs}
              defaultOptions={paymentFrequencyOptions}
              noOptionsMessage="Sin frecuencias"
            />
            <input type="hidden" {...register('paymentFrequencyId')} />
            {errors.paymentFrequencyId ? (
              <p className="text-xs text-red-500">
                {errors.paymentFrequencyId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Gracia a capital (número de cuotas)
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('gracePrincipal', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.gracePrincipal ? (
              <p className="text-xs text-red-500">
                {errors.gracePrincipal.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Gracia a interés (número de cuotas)
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('graceInterest', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.graceInterest ? (
              <p className="text-xs text-red-500">
                {errors.graceInterest.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Garantías y seguros
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40 dark:border-slate-700"
                {...register('requiresCollateral')}
                disabled={isSaving}
              />
              Requiere garantía
            </label>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Ratio mínimo de garantía (ej. 1.20 = 120%)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 dark:disabled:bg-slate-800"
              {...register('minCollateralRatio', {
                setValueAs: toOptionalNumber,
              })}
              disabled={isSaving || !requiresCollateral}
            />
            {errors.minCollateralRatio ? (
              <p className="text-xs text-red-500">
                {errors.minCollateralRatio.message}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40 dark:border-slate-700"
                {...register('hasInsurance')}
                disabled={isSaving}
              />
              Tiene seguro
            </label>
          </div>
        </div>
        {hasInsurance && insurances?.length === 0 ? (
          <p className="text-sm text-amber-600 dark:text-amber-300">
            Has marcado que tiene seguro, pero no hay seguros agregados.
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Regulación
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tipo de cartera
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={
                portfolioTypeOptions.find((option) => option.value === portfolioTypeId) ?? null
              }
              onChange={(option) =>
                setValue('portfolioTypeId', option?.value ?? '', {
                  shouldValidate: true,
                })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(portfolioTypeOptions, inputValue))
              }
              placeholder="Selecciona un tipo"
              inputId="portfolioTypeId"
              instanceId="loan-product-portfolio-type-id"
              isDisabled={isSaving || isLoadingCatalogs}
              defaultOptions={portfolioTypeOptions}
              noOptionsMessage="Sin tipos de cartera"
            />
            <input type="hidden" {...register('portfolioTypeId')} />
            {errors.portfolioTypeId ? (
              <p className="text-xs text-red-500">
                {errors.portfolioTypeId.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Mapeo contable (GL)
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <input type="hidden" {...register('glLoanPortfolioAccountId')} />
          <input type="hidden" {...register('glInterestIncomeAccountId')} />
          <input type="hidden" {...register('glInterestSuspenseAccountId')} />
          <input type="hidden" {...register('glFeeIncomeAccountId')} />
          <input type="hidden" {...register('glInsurancePayableAccountId')} />
          <GlAccountsSelector
            label="Cuenta cartera (requerida)"
            value={useWatch({ control, name: 'glLoanPortfolioAccountId' })}
            onChange={(accountId) => setValue('glLoanPortfolioAccountId', accountId)}
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
          {errors.glLoanPortfolioAccountId ? (
            <p className="text-xs text-red-500">
              {errors.glLoanPortfolioAccountId.message}
            </p>
          ) : null}

          <GlAccountsSelector
            label="Cuenta ingresos por intereses (requerida)"
            value={useWatch({ control, name: 'glInterestIncomeAccountId' })}
            onChange={(accountId) => setValue('glInterestIncomeAccountId', accountId)}
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
          {errors.glInterestIncomeAccountId ? (
            <p className="text-xs text-red-500">
              {errors.glInterestIncomeAccountId.message}
            </p>
          ) : null}

          <GlAccountsSelector
            label="Cuenta intereses suspendidos (opcional)"
            value={useWatch({ control, name: 'glInterestSuspenseAccountId' })}
            onChange={(accountId) => setValue('glInterestSuspenseAccountId', accountId)}
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />

          <GlAccountsSelector
            label="Cuenta ingresos por comisiones (opcional)"
            value={useWatch({ control, name: 'glFeeIncomeAccountId' })}
            onChange={(accountId) => setValue('glFeeIncomeAccountId', accountId)}
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />

          <GlAccountsSelector
            label="Cuenta seguros por pagar (opcional)"
            value={useWatch({ control, name: 'glInsurancePayableAccountId' })}
            onChange={(accountId) => setValue('glInsurancePayableAccountId', accountId)}
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <FeesEditor
          control={control}
          register={register}
          errors={errors}
          disabled={isSaving || isLoadingCatalogs}
          allowRemove={!isEdit}
          feeTypes={catalogs.feeTypes}
          feeChargeBases={catalogs.feeChargeBases}
          feeValueTypes={catalogs.feeValueTypes}
          feeChargeTimings={catalogs.feeChargeTimings}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <InsurancesEditor
          control={control}
          register={register}
          errors={errors}
          disabled={isSaving || isLoadingCatalogs || !hasInsurance}
          allowRemove={!isEdit}
          insuranceTypes={catalogs.insuranceTypes}
          insuranceCalculationBases={catalogs.insuranceCalculationBases}
          insuranceCoveragePeriods={catalogs.insuranceCoveragePeriods}
          insuranceChargeTimings={catalogs.insuranceChargeTimings}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <CollateralRulesEditor
          control={control}
          register={register}
          errors={errors}
          disabled={isSaving || isLoadingCatalogs || !requiresCollateral}
          allowRemove={!isEdit}
          collateralTypes={catalogs.collateralTypes}
        />
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary px-4 py-2 text-sm"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
