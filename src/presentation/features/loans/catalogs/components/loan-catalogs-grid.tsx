import { Link } from 'react-router-dom'
import type { LoanCatalogDefinition } from '@/core/loans/catalogs/catalog-definitions'

interface LoanCatalogsGridProps {
  catalogs: LoanCatalogDefinition[]
}

export const LoanCatalogsGrid = ({ catalogs }: LoanCatalogsGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {catalogs.map((catalog) => (
        <Link
          key={catalog.key}
          to={`/loans/products/catalogs/${catalog.key}`}
          className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary dark:text-slate-100">
                {catalog.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {catalog.description ?? 'Gestiona los elementos disponibles en este catálogo.'}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Ver
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
