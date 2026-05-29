import { useCallback, useEffect, useState } from 'react'
import { listLoanCatalogItemsAction } from '@/core/actions/loans/list-loan-catalog-items.action'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

interface DelinquencyPolicyCatalogsState {
  rateBases: LoanCatalogItemDto[]
  calculationBases: LoanCatalogItemDto[]
  roundingModes: LoanCatalogItemDto[]
  isLoading: boolean
  error: string | null
}

const sortCatalogItems = (items: LoanCatalogItemDto[]) =>
  [...items].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (orderDiff !== 0) return orderDiff
    return a.name.localeCompare(b.name)
  })

export const useDelinquencyPolicyCatalogs = () => {
  const [state, setState] = useState<DelinquencyPolicyCatalogsState>({
    rateBases: [],
    calculationBases: [],
    roundingModes: [],
    isLoading: false,
    error: null,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const [rateBases, calculationBases, roundingModes] = await Promise.all([
      listLoanCatalogItemsAction('rate-bases', { isActive: true }),
      listLoanCatalogItemsAction('delinquency-calculation-bases', {
        isActive: true,
      }),
      listLoanCatalogItemsAction('rounding-modes', { isActive: true }),
    ])

    if (!rateBases.success || !calculationBases.success || !roundingModes.success) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'No fue posible cargar los catálogos de mora.',
      }))
      return
    }

    setState({
      rateBases: sortCatalogItems(rateBases.data),
      calculationBases: sortCatalogItems(calculationBases.data),
      roundingModes: sortCatalogItems(roundingModes.data),
      isLoading: false,
      error: null,
    })
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    ...state,
    load,
  }
}
