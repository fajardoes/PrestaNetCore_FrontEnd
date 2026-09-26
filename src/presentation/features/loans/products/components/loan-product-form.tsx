import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Landmark,
  Percent,
  Receipt,
  Scale,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Umbrella,
} from 'lucide-react'
import { useForm, useWatch, type FieldErrors } from 'react-hook-form'
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
import { ProductFormSection } from '@/presentation/features/loans/products/components/product-form-section'
import {
  ProductFormSectionNav,
  type ProductFormSectionNavItem,
} from '@/presentation/features/loans/products/components/product-form-section-nav'
import Select from '@/presentation/share/components/select'

interface LoanCatalogOptions {
  termUnits: LoanCatalogItemDto[]
  interestRateTypes: LoanCatalogItemDto[]
  rateBases: LoanCatalogItemDto[]
  amortizationMethods: LoanCatalogItemDto[]
  paymentFrequencies: LoanCatalogItemDto[]
  portfolioTypes: LoanCatalogItemDto[]
  dayRules: LoanCatalogItemDto[]
  roundingModes: LoanCatalogItemDto[]
  holidayAdjustmentRules: LoanCatalogItemDto[]
  feeTypes: LoanCatalogItemDto[]
  feeChargeBases: LoanCatalogItemDto[]
  feeValueTypes: LoanCatalogItemDto[]
  feeChargeTimings: LoanCatalogItemDto[]
  insuranceTypes: LoanCatalogItemDto[]
  insuranceCalculationBases: LoanCatalogItemDto[]
  insuranceValueTypes: LoanCatalogItemDto[]
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
  minNominalRate: 0,
  maxNominalRate: 0,
  rateBaseId: '',
  amortizationMethodId: '',
  paymentFrequencyId: '',
  gracePrincipal: 0,
  graceInterest: 0,
  requiresCollateral: false,
  minCollateralRatio: undefined,
  hasInsurance: false,
  portfolioTypeId: '',
  dayRuleId: '',
  roundingModeId: '',
  holidayAdjustmentRuleId: '',
  glLoanPortfolioAccountId: '',
  glInterestIncomeAccountId: '',
  glInterestReceivableAccountId: '',
  glInterestSuspenseAccountId: null,
  glFeeIncomeAccountId: null,
  glDeferredFeeAccountId: null,
  glInsurancePayableAccountId: null,
  hasActiveDisbursementFees: false,
  hasActiveDisbursementInsurances: false,
  fees: [],
  insurances: [],
  collateralRules: [],
}

const toNumberValue = (value: string) => (value === '' ? undefined : Number(value))
const toOptionalNumber = (value: string) => (value === '' ? undefined : Number(value))
const toOptionalText = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
type ProductFormSectionId =
  | 'general'
  | 'conditions'
  | 'interest'
  | 'collateral'
  | 'regulation'
  | 'accounting'
  | 'fees'
  | 'insurance'
  | 'collateralRules'

const productFormSections: Array<ProductFormSectionNavItem & { id: ProductFormSectionId }> = [
  { id: 'general', title: 'Datos generales', icon: FileText },
  { id: 'conditions', title: 'Condiciones', icon: SlidersHorizontal },
  { id: 'interest', title: 'Interés y amortización', icon: Percent },
  { id: 'collateral', title: 'Garantías y seguros', icon: ShieldCheck },
  { id: 'regulation', title: 'Regulación', icon: Scale },
  { id: 'accounting', title: 'Mapeo contable', icon: Landmark },
  { id: 'fees', title: 'Comisiones y cargos', icon: Receipt },
  { id: 'insurance', title: 'Seguros', icon: Umbrella },
  { id: 'collateralRules', title: 'Reglas de garantías', icon: Shield },
]

const sectionErrorFields: Record<
  ProductFormSectionId,
  Array<keyof LoanProductFormValues>
> = {
  general: ['code', 'name', 'description', 'isActive'],
  conditions: [
    'currencyCode',
    'minAmount',
    'maxAmount',
    'minTerm',
    'maxTerm',
    'termUnitId',
  ],
  interest: [
    'interestRateTypeId',
    'nominalRate',
    'minNominalRate',
    'maxNominalRate',
    'rateBaseId',
    'amortizationMethodId',
    'paymentFrequencyId',
    'gracePrincipal',
    'graceInterest',
  ],
  collateral: ['requiresCollateral', 'minCollateralRatio', 'hasInsurance'],
  regulation: [
    'portfolioTypeId',
    'dayRuleId',
    'roundingModeId',
    'holidayAdjustmentRuleId',
  ],
  accounting: [
    'glLoanPortfolioAccountId',
    'glInterestIncomeAccountId',
    'glInterestReceivableAccountId',
    'glInterestSuspenseAccountId',
    'glFeeIncomeAccountId',
    'glDeferredFeeAccountId',
    'glInsurancePayableAccountId',
  ],
  fees: ['fees', 'hasActiveDisbursementFees'],
  insurance: ['insurances', 'hasActiveDisbursementInsurances'],
  collateralRules: ['collateralRules'],
}

const getFirstSectionWithErrors = (
  validationErrors: FieldErrors<LoanProductFormValues>,
): ProductFormSectionId | undefined =>
  productFormSections.find((section) =>
    sectionErrorFields[section.id].some((field) => Boolean(validationErrors[field])),
  )?.id

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
  const [activeSection, setActiveSection] = useState<ProductFormSectionId>('general')
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LoanProductFormValues>({
    resolver: yupResolver(loanProductFormSchema),
    defaultValues,
    shouldUnregister: false,
  })

  const hasSectionError = (sectionId: string) => {
    const fields = sectionErrorFields[sectionId as ProductFormSectionId]
    return fields?.some((field) => Boolean(errors[field])) ?? false
  }

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
  const fees = useWatch({ control, name: 'fees' })
  const termUnitId = useWatch({ control, name: 'termUnitId' })
  const interestRateTypeId = useWatch({ control, name: 'interestRateTypeId' })
  const rateBaseId = useWatch({ control, name: 'rateBaseId' })
  const amortizationMethodId = useWatch({ control, name: 'amortizationMethodId' })
  const paymentFrequencyId = useWatch({ control, name: 'paymentFrequencyId' })
  const portfolioTypeId = useWatch({ control, name: 'portfolioTypeId' })
  const dayRuleId = useWatch({ control, name: 'dayRuleId' })
  const roundingModeId = useWatch({ control, name: 'roundingModeId' })
  const holidayAdjustmentRuleId = useWatch({
    control,
    name: 'holidayAdjustmentRuleId',
  })
  const selectedTermUnit = catalogs.termUnits.find((item) => item.id === termUnitId)
  const termUnitLabel = selectedTermUnit?.name ?? 'unidad'
  const termUnitOptions = useMemo(
    () =>
      catalogs.termUnits.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.termUnits],
  )
  const interestRateTypeOptions = useMemo(
    () =>
      catalogs.interestRateTypes.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.interestRateTypes],
  )
  const rateBaseOptions = useMemo(
    () =>
      catalogs.rateBases.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.rateBases],
  )
  const amortizationMethodOptions = useMemo(
    () =>
      catalogs.amortizationMethods.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.amortizationMethods],
  )
  const paymentFrequencyOptions = useMemo(
    () =>
      catalogs.paymentFrequencies.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.paymentFrequencies],
  )
  const portfolioTypeOptions = useMemo(
    () =>
      catalogs.portfolioTypes.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.portfolioTypes],
  )
  const dayRuleOptions = useMemo(
    () =>
      catalogs.dayRules.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.dayRules],
  )
  const roundingModeOptions = useMemo(
    () =>
      catalogs.roundingModes.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.roundingModes],
  )
  const holidayAdjustmentRuleOptions = useMemo(
    () =>
      catalogs.holidayAdjustmentRules.map((item) => ({
        value: item.id,
        label: item.name,
        meta: item,
      })),
    [catalogs.holidayAdjustmentRules],
  )

  useEffect(() => {
    if (!requiresCollateral) {
      setValue('minCollateralRatio', null)
    }
  }, [requiresCollateral, setValue])

  useEffect(() => {
    const hasActiveDisbursementFees = (fees ?? []).some((fee) => {
      if (fee.isActive === false) return false
      const timing = catalogs.feeChargeTimings.find((item) => item.id === fee.chargeTimingId)
      return (timing?.code ?? '').trim().toUpperCase() === 'DISBURSEMENT'
    })
    setValue('hasActiveDisbursementFees', hasActiveDisbursementFees, {
      shouldValidate: true,
    })
  }, [catalogs.feeChargeTimings, fees, setValue])

  useEffect(() => {
    const hasActiveDisbursementInsurances = (insurances ?? []).some((insurance) => {
      if (insurance.isActive === false) return false
      const timing = catalogs.insuranceChargeTimings.find(
        (item) => item.id === insurance.chargeTimingId,
      )
      return (timing?.code ?? '').trim().toUpperCase() === 'DISBURSEMENT'
    })
    setValue('hasActiveDisbursementInsurances', hasActiveDisbursementInsurances, {
      shouldValidate: true,
    })
  }, [catalogs.insuranceChargeTimings, insurances, setValue])

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
      dayRuleId: values.dayRuleId.trim(),
      roundingModeId: values.roundingModeId.trim(),
      holidayAdjustmentRuleId: values.holidayAdjustmentRuleId.trim(),
      glLoanPortfolioAccountId: values.glLoanPortfolioAccountId.trim(),
      glInterestIncomeAccountId: values.glInterestIncomeAccountId.trim(),
      glInterestReceivableAccountId: values.glInterestReceivableAccountId.trim(),
      glInterestSuspenseAccountId: toOptionalText(values.glInterestSuspenseAccountId),
      glFeeIncomeAccountId: toOptionalText(values.glFeeIncomeAccountId),
      glDeferredFeeAccountId: toOptionalText(values.glDeferredFeeAccountId),
      glInsurancePayableAccountId: toOptionalText(values.glInsurancePayableAccountId),
      minCollateralRatio: values.requiresCollateral
        ? values.minCollateralRatio
        : undefined,
    }
    void onSubmit(normalized)
  }, (validationErrors) => {
    const firstSectionWithErrors = getFirstSectionWithErrors(validationErrors)
    if (firstSectionWithErrors) {
      setActiveSection(firstSectionWithErrors)
    }
  })

  return (
    <form className="space-y-3" onSubmit={submitHandler} noValidate>
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {catalogsError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-100">
          {catalogsError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,250px)_minmax(0,1fr)] lg:items-start">
        <ProductFormSectionNav
          items={productFormSections}
          activeSection={activeSection}
          onSelect={(sectionId) => setActiveSection(sectionId as ProductFormSectionId)}
          hasError={hasSectionError}
        />
        <div className="min-w-0 space-y-4">
      <div hidden={activeSection !== 'general'}>
        <ProductFormSection
          title="Datos generales"
          description="Identifica el producto y define su disponibilidad."
        >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'conditions'}>
        <ProductFormSection
          title="Condiciones"
          description="Define moneda, montos y plazo del producto."
        >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
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
            <Select<LoanCatalogItemDto>
              value={termUnitOptions.find((option) => option.value === termUnitId) ?? null}
              onChange={(option) =>
                setValue('termUnitId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={termUnitOptions}
              placeholder="Selecciona una unidad"
              inputId="termUnitId"
              instanceId="loan-product-term-unit-id"
              isDisabled={isSaving || isLoadingCatalogs}
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
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'interest'}>
        <ProductFormSection
          title="Interés y amortización"
          description="Configura la tasa, la frecuencia y el método de amortización."
        >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tipo de tasa
            </label>
            <Select<LoanCatalogItemDto>
              value={
                interestRateTypeOptions.find((option) => option.value === interestRateTypeId) ??
                null
              }
              onChange={(option) =>
                setValue('interestRateTypeId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={interestRateTypeOptions}
              placeholder="Selecciona un tipo"
              inputId="interestRateTypeId"
              instanceId="loan-product-interest-rate-type-id"
              isDisabled={isSaving || isLoadingCatalogs}
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
              Tasa nominal predeterminada (% anual)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 24 o 24.5"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('nominalRate', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se usa por defecto en los planes de pago. Ingresa el porcentaje anual (ej. 24 = 24%).
            </p>
            {errors.nominalRate ? (
              <p className="text-xs text-red-500">{errors.nominalRate.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tasa mínima nominal (% anual)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 8"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('minNominalRate', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.minNominalRate ? (
              <p className="text-xs text-red-500">{errors.minNominalRate.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tasa máxima nominal (% anual)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ej. 12"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('maxNominalRate', {
                setValueAs: toNumberValue,
              })}
              disabled={isSaving}
            />
            {errors.maxNominalRate ? (
              <p className="text-xs text-red-500">{errors.maxNominalRate.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Base de tasa
            </label>
            <Select<LoanCatalogItemDto>
              value={rateBaseOptions.find((option) => option.value === rateBaseId) ?? null}
              onChange={(option) =>
                setValue('rateBaseId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={rateBaseOptions}
              placeholder="Selecciona una base"
              inputId="rateBaseId"
              instanceId="loan-product-rate-base-id"
              isDisabled={isSaving || isLoadingCatalogs}
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
            <Select<LoanCatalogItemDto>
              value={
                amortizationMethodOptions.find(
                  (option) => option.value === amortizationMethodId,
                ) ?? null
              }
              onChange={(option) =>
                setValue('amortizationMethodId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={amortizationMethodOptions}
              placeholder="Selecciona un método"
              inputId="amortizationMethodId"
              instanceId="loan-product-amortization-method-id"
              isDisabled={isSaving || isLoadingCatalogs}
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
            <Select<LoanCatalogItemDto>
              value={
                paymentFrequencyOptions.find((option) => option.value === paymentFrequencyId) ??
                null
              }
              onChange={(option) =>
                setValue('paymentFrequencyId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={paymentFrequencyOptions}
              placeholder="Selecciona una frecuencia"
              inputId="paymentFrequencyId"
              instanceId="loan-product-payment-frequency-id"
              isDisabled={isSaving || isLoadingCatalogs}
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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          La tasa nominal predeterminada debe estar entre la tasa mínima y la máxima. Para una
          tasa fija, usa el mismo valor en los tres campos.
        </p>
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'collateral'}>
        <ProductFormSection
          title="Garantías y seguros"
          description="Indica si el producto requiere garantías o seguros."
        >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
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
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'regulation'}>
        <ProductFormSection
          title="Regulación"
          description="Define las reglas regulatorias y operativas del producto."
        >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Tipo de cartera
            </label>
            <Select<LoanCatalogItemDto>
              value={
                portfolioTypeOptions.find((option) => option.value === portfolioTypeId) ?? null
              }
              onChange={(option) =>
                setValue('portfolioTypeId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={portfolioTypeOptions}
              placeholder="Selecciona un tipo"
              inputId="portfolioTypeId"
              instanceId="loan-product-portfolio-type-id"
              isDisabled={isSaving || isLoadingCatalogs}
              noOptionsMessage="Sin tipos de cartera"
            />
            <input type="hidden" {...register('portfolioTypeId')} />
            {errors.portfolioTypeId ? (
              <p className="text-xs text-red-500">
                {errors.portfolioTypeId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Regla de días
            </label>
            <Select<LoanCatalogItemDto>
              value={dayRuleOptions.find((option) => option.value === dayRuleId) ?? null}
              onChange={(option) =>
                setValue('dayRuleId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={dayRuleOptions}
              placeholder="Selecciona una regla"
              inputId="dayRuleId"
              instanceId="loan-product-day-rule-id"
              isDisabled={isSaving || isLoadingCatalogs}
              noOptionsMessage="Sin reglas de días"
            />
            <input type="hidden" {...register('dayRuleId')} />
            {errors.dayRuleId ? (
              <p className="text-xs text-red-500">{errors.dayRuleId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Modo de redondeo
            </label>
            <Select<LoanCatalogItemDto>
              value={
                roundingModeOptions.find((option) => option.value === roundingModeId) ?? null
              }
              onChange={(option) =>
                setValue('roundingModeId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={roundingModeOptions}
              placeholder="Selecciona un modo"
              inputId="roundingModeId"
              instanceId="loan-product-rounding-mode-id"
              isDisabled={isSaving || isLoadingCatalogs}
              noOptionsMessage="Sin modos de redondeo"
            />
            <input type="hidden" {...register('roundingModeId')} />
            {errors.roundingModeId ? (
              <p className="text-xs text-red-500">{errors.roundingModeId.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-200">
              Regla de ajuste por feriado
            </label>
            <Select<LoanCatalogItemDto>
              value={
                holidayAdjustmentRuleOptions.find(
                  (option) => option.value === holidayAdjustmentRuleId,
                ) ?? null
              }
              onChange={(option) =>
                setValue('holidayAdjustmentRuleId', option?.value ?? '', {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={holidayAdjustmentRuleOptions}
              placeholder="Selecciona una regla"
              inputId="holidayAdjustmentRuleId"
              instanceId="loan-product-holiday-adjustment-rule-id"
              isDisabled={isSaving || isLoadingCatalogs}
              noOptionsMessage="Sin reglas de ajuste"
            />
            <input type="hidden" {...register('holidayAdjustmentRuleId')} />
            {errors.holidayAdjustmentRuleId ? (
              <p className="text-xs text-red-500">
                {errors.holidayAdjustmentRuleId.message}
              </p>
            ) : null}
          </div>
        </div>
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'accounting'}>
        <ProductFormSection
          title="Mapeo contable"
          description="Define las cuentas contables que utilizará automáticamente este producto cuando genere movimientos financieros."
        >
        <div className="space-y-4">
          <input type="hidden" {...register('glLoanPortfolioAccountId')} />
          <input type="hidden" {...register('glInterestIncomeAccountId')} />
          <input type="hidden" {...register('glInterestReceivableAccountId')} />
          <input type="hidden" {...register('glInterestSuspenseAccountId')} />
          <input type="hidden" {...register('hasActiveDisbursementFees')} />
          <input type="hidden" {...register('hasActiveDisbursementInsurances')} />
          <input type="hidden" {...register('glFeeIncomeAccountId')} />
          <input type="hidden" {...register('glDeferredFeeAccountId')} />
          <input type="hidden" {...register('glInsurancePayableAccountId')} />
          <div className="border-b border-slate-200 pb-2 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Cuentas principales
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Son necesarias para registrar el capital y los intereses del préstamo.
            </p>
          </div>
          <GlAccountsSelector
            label="Capital del préstamo"
            description="Cuenta donde se registra el saldo de capital entregado al cliente."
            required
            value={useWatch({ control, name: 'glLoanPortfolioAccountId' })}
            onChange={(accountId) =>
              setValue('glLoanPortfolioAccountId', accountId, { shouldDirty: true })
            }
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
            label="Ingresos por intereses"
            description="Cuenta donde se reconocen los intereses generados por el préstamo."
            required
            value={useWatch({ control, name: 'glInterestIncomeAccountId' })}
            onChange={(accountId) =>
              setValue('glInterestIncomeAccountId', accountId, { shouldDirty: true })
            }
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
            label="Intereses por cobrar"
            description="Cuenta para intereses ya generados que todavía no han sido cobrados."
            required
            value={useWatch({ control, name: 'glInterestReceivableAccountId' })}
            onChange={(accountId) =>
              setValue('glInterestReceivableAccountId', accountId, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
          {errors.glInterestReceivableAccountId ? (
            <p className="text-xs text-red-500">
              {errors.glInterestReceivableAccountId.message}
            </p>
          ) : null}

          <div className="border-b border-slate-200 pb-2 pt-1 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Otras cuentas y reconocimiento
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Úsalas solo cuando el producto maneje intereses suspendidos, comisiones o seguros.
            </p>
          </div>

          <GlAccountsSelector
            label="Intereses suspendidos"
            description="Cuenta para intereses que deben separarse temporalmente de los ingresos normales."
            required={false}
            value={useWatch({ control, name: 'glInterestSuspenseAccountId' })}
            onChange={(accountId) =>
              setValue('glInterestSuspenseAccountId', accountId, { shouldDirty: true })
            }
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />

          <GlAccountsSelector
            label="Ingresos por comisiones"
            description="Cuenta donde se reconocen los ingresos generados por cargos y comisiones."
            required={false}
            value={useWatch({ control, name: 'glFeeIncomeAccountId' })}
            onChange={(accountId) =>
              setValue('glFeeIncomeAccountId', accountId, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
          {errors.glFeeIncomeAccountId ? (
            <p className="text-xs text-red-500">{errors.glFeeIncomeAccountId.message}</p>
          ) : null}

          <GlAccountsSelector
            label="Comisiones diferidas"
            description="Cuenta temporal para comisiones descontadas al desembolso antes de reconocerlas."
            required={false}
            value={useWatch({ control, name: 'glDeferredFeeAccountId' })}
            onChange={(accountId) =>
              setValue('glDeferredFeeAccountId', accountId, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
          {errors.glDeferredFeeAccountId ? (
            <p className="text-xs text-red-500">{errors.glDeferredFeeAccountId.message}</p>
          ) : null}

          <GlAccountsSelector
            label="Seguros por pagar"
            description="Cuenta donde queda pendiente el pago de las primas a la aseguradora."
            required={false}
            value={useWatch({ control, name: 'glInsurancePayableAccountId' })}
            onChange={(accountId) =>
              setValue('glInsurancePayableAccountId', accountId, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onSearch={onSearchAccounts}
            onResolveAccount={onResolveAccount}
            isSearching={isSearchingAccounts}
            error={accountsError ?? undefined}
          />
          {errors.glInsurancePayableAccountId ? (
            <p className="text-xs text-red-500">
              {errors.glInsurancePayableAccountId.message}
            </p>
          ) : null}
        </div>
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'fees'}>
        <ProductFormSection
          title="Comisiones y cargos"
          description="Configura los cargos que aplican al producto y cuándo se cobran."
        >
        <FeesEditor
          control={control}
          errors={errors}
          disabled={isSaving || isLoadingCatalogs}
          allowRemove={!isEdit}
          feeTypes={catalogs.feeTypes}
          feeChargeBases={catalogs.feeChargeBases}
          feeValueTypes={catalogs.feeValueTypes}
          feeChargeTimings={catalogs.feeChargeTimings}
        />
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'insurance'}>
        <ProductFormSection
          title="Seguros"
          description="Configura los seguros asociados y sus condiciones de cobro."
        >
        <InsurancesEditor
          control={control}
          errors={errors}
          disabled={isSaving || isLoadingCatalogs}
          allowRemove={!isEdit}
          onInsuranceSave={() =>
            setValue('hasInsurance', true, { shouldDirty: true, shouldValidate: true })
          }
          insuranceTypes={catalogs.insuranceTypes}
          insuranceCalculationBases={catalogs.insuranceCalculationBases}
          insuranceValueTypes={catalogs.insuranceValueTypes}
          insuranceChargeTimings={catalogs.insuranceChargeTimings}
        />
        </ProductFormSection>
      </div>

      <div hidden={activeSection !== 'collateralRules'}>
        <ProductFormSection
          title="Reglas de garantías"
          description="Define el ratio mínimo y el estado de cada tipo de garantía."
        >
        <CollateralRulesEditor
          control={control}
          errors={errors}
          disabled={isSaving || isLoadingCatalogs || !requiresCollateral}
          allowRemove={!isEdit}
          collateralTypes={catalogs.collateralTypes}
        />
        </ProductFormSection>
      </div>

        </div>
      </div>

      <div className="sticky bottom-3 z-20 mt-4 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/95 dark:shadow-black/20 sm:flex-row sm:items-center sm:justify-between">
        <div
          aria-live="polite"
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-2.5 py-1 ${
            isDirty
              ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200'
              : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isDirty ? 'bg-amber-500 dark:bg-amber-400' : 'bg-slate-400 dark:bg-slate-500'
            }`}
            aria-hidden="true"
          />
          <span className="text-xs font-medium">
            {isDirty ? 'Cambios pendientes' : 'Sin cambios pendientes'}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary px-4 py-1.5 text-sm"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary px-4 py-1.5 text-sm"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  )
}
