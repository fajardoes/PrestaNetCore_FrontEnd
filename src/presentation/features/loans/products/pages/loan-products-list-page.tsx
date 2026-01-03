import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoanProductsList } from '@/presentation/features/loans/products/hooks/use-loan-products-list'
import { useLoanProductMutations } from '@/presentation/features/loans/products/hooks/use-loan-product-mutations'
import { LoanProductsFilters } from '@/presentation/features/loans/products/components/loan-products-filters'
import { LoanProductsTable } from '@/presentation/features/loans/products/components/loan-products-table'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { LoanProductDetailModal } from '@/presentation/features/loans/products/components/loan-product-detail-modal'
import { useLoanProductDetail } from '@/presentation/features/loans/products/hooks/use-loan-product-detail'
import { useLoanCatalogsCache } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalogs-cache'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

export const LoanProductsListPage = () => {
  const navigate = useNavigate()
  const { filters, setFilters, load, items, isLoading, error } =
    useLoanProductsList()
  const {
    toggleStatus,
    isSaving: isToggling,
    error: mutationError,
    clearError,
  } = useLoanProductMutations()
  const [pendingToggle, setPendingToggle] = useState<LoanProductListItemDto | null>(
    null,
  )
  const [detailItem, setDetailItem] = useState<LoanProductListItemDto | null>(null)
  const { data, isLoading: isDetailLoading, error: detailError, loadById, reset } =
    useLoanProductDetail()
  const catalogsCache = useLoanCatalogsCache()
  const { getAccountById } = useGlAccountsSearch()

  useEffect(() => {
    if (detailItem?.id) {
      void loadById(detailItem.id)
      return
    }
    reset()
  }, [detailItem, loadById, reset])

  const statusValue: StatusFilterValue = useMemo(() => {
    if (filters.isActive === true) return 'active'
    if (filters.isActive === false) return 'inactive'
    return 'all'
  }, [filters.isActive])

  const handleStatusChange = (value: StatusFilterValue) => {
    setFilters((prev) => ({
      ...prev,
      isActive: value === 'all' ? undefined : value === 'active',
    }))
  }

  const handleSearch = () => {
    clearError()
    void load(filters)
  }

  const handleToggleConfirm = async () => {
    if (!pendingToggle) return
    const nextStatus = !pendingToggle.isActive
    const result = await toggleStatus(pendingToggle.id, nextStatus)
    if (result.success) {
      setPendingToggle(null)
      await load(filters)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Productos de Préstamo
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gestiona el catálogo de productos, filtros y estado de activación.
        </p>
      </div>

      {mutationError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
          {mutationError}
        </div>
      ) : null}

      <LoanProductsFilters
        search={filters.search ?? ''}
        status={statusValue}
        onSearchChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
        onStatusChange={handleStatusChange}
        onSearch={handleSearch}
        onCreate={() => navigate('/loans/products/new')}
      />

      <LoanProductsTable
        items={items}
        isLoading={isLoading}
        error={error}
        onEdit={(item) => navigate(`/loans/products/${item.id}`)}
        onViewDetail={(item) => setDetailItem(item)}
        onToggleStatus={(item) => setPendingToggle(item)}
        isProcessingId={isToggling ? pendingToggle?.id ?? null : null}
      />

      <ConfirmModal
        open={Boolean(pendingToggle)}
        title={
          pendingToggle?.isActive ? 'Desactivar producto' : 'Activar producto'
        }
        description={
          pendingToggle?.isActive
            ? '¿Deseas desactivar este producto?'
            : '¿Deseas activar este producto?'
        }
        confirmLabel={pendingToggle?.isActive ? 'Desactivar' : 'Activar'}
        onCancel={() => setPendingToggle(null)}
        onConfirm={handleToggleConfirm}
        isProcessing={isToggling}
      />

      <LoanProductDetailModal
        open={Boolean(detailItem)}
        product={data}
        isLoading={isDetailLoading}
        error={detailError}
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
        onResolveAccount={getAccountById}
        onClose={() => setDetailItem(null)}
      />
    </div>
  )
}
