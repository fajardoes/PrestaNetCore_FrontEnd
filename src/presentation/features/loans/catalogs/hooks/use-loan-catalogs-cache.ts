import { useCallback, useEffect, useState } from 'react'
import { listLoanCatalogItemsAction } from '@/core/actions/loans/list-loan-catalog-items.action'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

interface LoanCatalogsCacheState {
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

const emptyState: LoanCatalogsCacheState = {
  termUnits: [],
  interestRateTypes: [],
  rateBases: [],
  amortizationMethods: [],
  paymentFrequencies: [],
  portfolioTypes: [],
  feeTypes: [],
  feeChargeBases: [],
  feeValueTypes: [],
  feeChargeTimings: [],
  insuranceTypes: [],
  insuranceCalculationBases: [],
  insuranceCoveragePeriods: [],
  insuranceChargeTimings: [],
  collateralTypes: [],
}

const sortCatalogItems = (items: LoanCatalogItemDto[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name)
  })

export const useLoanCatalogsCache = () => {
  const [state, setState] = useState<LoanCatalogsCacheState>(emptyState)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCatalog = useCallback(async (catalogKey: Parameters<typeof listLoanCatalogItemsAction>[0]) => {
    const result = await listLoanCatalogItemsAction(catalogKey, {
      isActive: true,
    })
    if (result.success) {
      return sortCatalogItems(result.data)
    }
    throw new Error(result.error ?? 'No fue posible cargar los catálogos.')
  }, [])

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [
        termUnits,
        interestRateTypes,
        rateBases,
        amortizationMethods,
        paymentFrequencies,
        portfolioTypes,
        feeTypes,
        feeChargeBases,
        feeValueTypes,
        feeChargeTimings,
        insuranceTypes,
        insuranceCalculationBases,
        insuranceCoveragePeriods,
        insuranceChargeTimings,
        collateralTypes,
      ] = await Promise.all([
        loadCatalog('term-units'),
        loadCatalog('interest-rate-types'),
        loadCatalog('rate-bases'),
        loadCatalog('amortization-methods'),
        loadCatalog('payment-frequencies'),
        loadCatalog('portfolio-types'),
        loadCatalog('fee-types'),
        loadCatalog('fee-charge-bases'),
        loadCatalog('fee-value-types'),
        loadCatalog('fee-charge-timings'),
        loadCatalog('insurance-types'),
        loadCatalog('insurance-calculation-bases'),
        loadCatalog('insurance-coverage-periods'),
        loadCatalog('insurance-charge-timings'),
        loadCatalog('collateral-types'),
      ])

      setState({
        termUnits,
        interestRateTypes,
        rateBases,
        amortizationMethods,
        paymentFrequencies,
        portfolioTypes,
        feeTypes,
        feeChargeBases,
        feeValueTypes,
        feeChargeTimings,
        insuranceTypes,
        insuranceCalculationBases,
        insuranceCoveragePeriods,
        insuranceChargeTimings,
        collateralTypes,
      })
      setIsLoading(false)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'No fue posible cargar los catálogos.'
      setError(message)
      setIsLoading(false)
    }
  }, [loadCatalog])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  return {
    ...state,
    isLoading,
    error,
    loadAll,
  }
}
