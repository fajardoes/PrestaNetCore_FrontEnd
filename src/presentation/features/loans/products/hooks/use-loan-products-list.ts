import { useCallback, useEffect, useRef, useState } from 'react'
import { listLoanProductsAction } from '@/core/actions/loans/list-loan-products.action'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { LoanProductListQueryDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-query.dto'

interface LoanProductsListState {
  items: LoanProductListItemDto[]
  isLoading: boolean
  error: string | null
}

const defaultFilters: LoanProductListQueryDto = {
  search: '',
  isActive: undefined,
  portfolioType: '',
  currencyCode: '',
}

const normalizeFilters = (filters: LoanProductListQueryDto) => ({
  search: filters.search?.trim() || undefined,
  isActive: typeof filters.isActive === 'boolean' ? filters.isActive : undefined,
  portfolioType: filters.portfolioType?.trim() || undefined,
  currencyCode: filters.currencyCode?.trim() || undefined,
})

export const useLoanProductsList = () => {
  const [filters, setFilters] = useState<LoanProductListQueryDto>(defaultFilters)
  const [state, setState] = useState<LoanProductsListState>({
    items: [],
    isLoading: false,
    error: null,
  })
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const load = useCallback(async (override?: LoanProductListQueryDto) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    const appliedFilters = normalizeFilters(override ?? filtersRef.current)
    const result = await listLoanProductsAction(appliedFilters)
    if (result.success) {
      setState({ items: result.data, isLoading: false, error: null })
    } else {
      setState({ items: [], isLoading: false, error: result.error })
    }
  }, [])

  useEffect(() => {
    void load(filtersRef.current)
  }, [load])

  return {
    filters,
    setFilters,
    load,
    items: state.items,
    isLoading: state.isLoading,
    error: state.error,
  }
}
