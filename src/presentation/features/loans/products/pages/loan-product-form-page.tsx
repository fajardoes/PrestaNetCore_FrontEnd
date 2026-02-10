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
      description: data.description ?? '',
      minCollateralRatio: data.minCollateralRatio ?? undefined,
      glInterestSuspenseAccountId: data.glInterestSuspenseAccountId ?? null,
      glFeeIncomeAccountId: data.glFeeIncomeAccountId ?? null,
      glInsurancePayableAccountId: data.glInsurancePayableAccountId ?? null,
      fees: data.fees ?? [],
      insurances: data.insurances ?? [],
      collateralRules: data.collateralRules ?? [],
    }
  }, [data])

  const handleSubmit = async (values: LoanProductFormValues) => {
    clearError()
    const payloadBase = {
      ...values,
      currencyCode: 'HNL',
      description: values.description ?? null,
      minCollateralRatio: values.requiresCollateral
        ? values.minCollateralRatio ?? null
        : null,
      glInterestSuspenseAccountId: values.glInterestSuspenseAccountId ?? null,
      glFeeIncomeAccountId: values.glFeeIncomeAccountId ?? null,
      glInsurancePayableAccountId: values.glInsurancePayableAccountId ?? null,
      fees: values.fees ?? [],
      insurances: values.hasInsurance ? values.insurances ?? [] : [],
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
          feeTypes: catalogsCache.feeTypes,
          feeChargeBases: catalogsCache.feeChargeBases,
          feeValueTypes: catalogsCache.feeValueTypes,
          feeChargeTimings: catalogsCache.feeChargeTimings,
          insuranceTypes: catalogsCache.insuranceTypes,
          insuranceCalculationBases: catalogsCache.insuranceCalculationBases,
          insuranceCoveragePeriods: catalogsCache.insuranceCoveragePeriods,
          insuranceChargeTimings: catalogsCache.insuranceChargeTimings,
          collateralTypes: catalogsCache.collateralTypes,
        }}
        isLoadingCatalogs={catalogsCache.isLoading}
        catalogsError={catalogsCache.error}
      />
    </div>
  )
}
