import { LOAN_CATALOG_DEFINITIONS } from '@/core/loans/catalogs/catalog-definitions'
import { LoanCatalogsGrid } from '@/presentation/features/loans/catalogs/components/loan-catalogs-grid'

export const LoanCatalogsHomePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Préstamos - Catálogos
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra los catálogos que alimentan los productos de préstamo.
        </p>
      </div>

      <LoanCatalogsGrid catalogs={LOAN_CATALOG_DEFINITIONS} />
    </div>
  )
}
