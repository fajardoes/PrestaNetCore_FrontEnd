import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LoanProductForm } from '@/presentation/features/loans/products/components/loan-product-form'
import { useLoanProductDetail } from '@/presentation/features/loans/products/hooks/use-loan-product-detail'
import { useLoanProductMutations } from '@/presentation/features/loans/products/hooks/use-loan-product-mutations'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import { useLoanCatalogsCache } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalogs-cache'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import type { LoanProductCreateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-create.dto'
import type { LoanProductUpdateDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-update.dto'
import { mapPercentInputToRate, mapRateToPercentValue } from '@/core/helpers/rate-percent'

export const LoanProductFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { data, isLoading, error, loadById, reset } = useLoanProductDetail()
  const {
    create,
    update,
    isSaving,
    error: saveError,
    clearError,
  } = useLoanProductMutations()
  const {
    searchAccounts,
    getAccountById,
    isLoading: isSearchingAccounts,
    error: accountsError,
  } = useGlAccountsSearch()
  const catalogsCache = useLoanCatalogsCache()

  useEffect(() => {
    if (id) {
      void loadById(id)
      return
    }
    reset()
  }, [id, loadById, reset])

  const initialValues = useMemo<LoanProductFormValues | undefined>(() => {
    if (!data) return undefined
    return {
      ...data,
      currencyCode: 'HNL',
      nominalRate: mapRateToPercentValue(data.nominalRate),
      minNominalRate: mapRateToPercentValue(data.minNominalRate),
      maxNominalRate: mapRateToPercentValue(data.maxNominalRate),
      description: data.description ?? '',
      minCollateralRatio: data.minCollateralRatio ?? undefined,
      glInterestReceivableAccountId: data.glInterestReceivableAccountId,
      glInterestSuspenseAccountId: data.glInterestSuspenseAccountId ?? null,
      glFeeIncomeAccountId: data.glFeeIncomeAccountId ?? null,
      glDeferredFeeAccountId: data.glDeferredFeeAccountId ?? null,
      glInsurancePayableAccountId: data.glInsurancePayableAccountId ?? null,
      hasActiveDisbursementFees: false,
      hasActiveDisbursementInsurances: false,
      fees: data.fees ?? [],
      insurances: data.insurances ?? [],
      collateralRules: data.collateralRules ?? [],
    }
  }, [data])

  const handleSubmit = async (values: LoanProductFormValues) => {
    clearError()
    const normalizedInsurances = (values.hasInsurance ? values.insurances ?? [] : []).map(
      (insurance) => ({
        id: insurance.id ?? null,
        insuranceTypeId: insurance.insuranceTypeId,
        calculationBaseId: insurance.calculationBaseId,
        valueTypeId: insurance.valueTypeId,
        value: insurance.value,
        chargeTimingId: insurance.chargeTimingId,
        isMandatory: insurance.isMandatory,
        isActive: insurance.isActive,
      }),
    )

    const payloadBase = {
      code: values.code,
      name: values.name,
      description: values.description ?? null,
      isActive: values.isActive,
      currencyCode: 'HNL',
      minAmount: values.minAmount,
      maxAmount: values.maxAmount,
      minTerm: values.minTerm,
      maxTerm: values.maxTerm,
      termUnitId: values.termUnitId,
      interestRateTypeId: values.interestRateTypeId,
      nominalRate: mapPercentInputToRate(values.nominalRate),
      minNominalRate: mapPercentInputToRate(values.minNominalRate),
      maxNominalRate: mapPercentInputToRate(values.maxNominalRate),
      rateBaseId: values.rateBaseId,
      amortizationMethodId: values.amortizationMethodId,
      paymentFrequencyId: values.paymentFrequencyId,
      gracePrincipal: values.gracePrincipal,
      graceInterest: values.graceInterest,
      requiresCollateral: values.requiresCollateral,
      minCollateralRatio: values.requiresCollateral
        ? values.minCollateralRatio ?? null
        : null,
      hasInsurance: values.hasInsurance,
      portfolioTypeId: values.portfolioTypeId,
      dayRuleId: values.dayRuleId,
      roundingModeId: values.roundingModeId,
      holidayAdjustmentRuleId: values.holidayAdjustmentRuleId,
      glLoanPortfolioAccountId: values.glLoanPortfolioAccountId,
      glInterestIncomeAccountId: values.glInterestIncomeAccountId,
      glInterestReceivableAccountId: values.glInterestReceivableAccountId,
      glInterestSuspenseAccountId: values.glInterestSuspenseAccountId ?? null,
      glFeeIncomeAccountId: values.glFeeIncomeAccountId ?? null,
      glDeferredFeeAccountId: values.glDeferredFeeAccountId ?? null,
      glInsurancePayableAccountId: values.glInsurancePayableAccountId ?? null,
      fees: values.fees ?? [],
      insurances: normalizedInsurances,
      collateralRules: values.requiresCollateral ? values.collateralRules ?? [] : [],
    }

    if (isEdit && id) {
      const payload: LoanProductUpdateDto = payloadBase
      const result = await update(id, payload)
      if (result.success) {
        navigate('/loans/products')
      }
      return
    }

    const payload: LoanProductCreateDto = payloadBase
    const result = await create(payload)
    if (result.success) {
      navigate('/loans/products')
    }
  }

  if (isEdit && isLoading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando producto...
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
          {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Define condiciones, reglas y contabilidad del producto.
        </p>
      </div>

      <LoanProductForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/loans/products')}
        isSaving={isSaving}
        error={saveError}
        isEdit={isEdit}
        onSearchAccounts={searchAccounts}
        onResolveAccount={getAccountById}
        isSearchingAccounts={isSearchingAccounts}
        accountsError={accountsError}
        catalogs={{
          termUnits: catalogsCache.termUnits,
          interestRateTypes: catalogsCache.interestRateTypes,
          rateBases: catalogsCache.rateBases,
          amortizationMethods: catalogsCache.amortizationMethods,
          paymentFrequencies: catalogsCache.paymentFrequencies,
          portfolioTypes: catalogsCache.portfolioTypes,
          dayRules: catalogsCache.dayRules,
          roundingModes: catalogsCache.roundingModes,
          holidayAdjustmentRules: catalogsCache.holidayAdjustmentRules,
          feeTypes: catalogsCache.feeTypes,
          feeChargeBases: catalogsCache.feeChargeBases,
          feeValueTypes: catalogsCache.feeValueTypes,
          feeChargeTimings: catalogsCache.feeChargeTimings,
          insuranceTypes: catalogsCache.insuranceTypes,
          insuranceCalculationBases: catalogsCache.insuranceCalculationBases,
          insuranceValueTypes: catalogsCache.insuranceValueTypes,
          insuranceChargeTimings: catalogsCache.insuranceChargeTimings,
          collateralTypes: catalogsCache.collateralTypes,
        }}
        isLoadingCatalogs={catalogsCache.isLoading}
        catalogsError={catalogsCache.error}
      />
    </div>
  )
}
