import type { LucideIcon } from 'lucide-react'

export interface ProductFormSectionNavItem {
  id: string
  title: string
  icon: LucideIcon
}

interface ProductFormSectionNavProps {
  items: ProductFormSectionNavItem[]
  activeSection: string
  onSelect: (sectionId: string) => void
  hasError: (sectionId: string) => boolean
}

export const ProductFormSectionNav = ({
  items,
  activeSection,
  onSelect,
  hasError,
}: ProductFormSectionNavProps) => (
  <nav
    aria-label="Secciones del producto de préstamo"
    className="rounded-lg border border-slate-200 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-900/60 lg:sticky lg:top-4"
  >
    <div className="mb-2 px-2 py-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Configuración
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Selecciona una sección para continuar.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-1 sm:flex sm:overflow-x-auto lg:grid lg:grid-cols-1 lg:overflow-visible">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.id === activeSection
        const sectionHasError = hasError(item.id)

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'step' : undefined}
            aria-label={`${item.title}${sectionHasError ? ', requiere atención' : ''}`}
            onClick={() => onSelect(item.id)}
            className={`group flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:min-w-[180px] lg:min-w-0 ${
              isActive
                ? 'border-sky-200 bg-white text-slate-900 shadow-sm dark:border-sky-900/70 dark:bg-slate-950 dark:text-slate-100'
                : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-950/70 dark:hover:text-slate-100'
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                isActive
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium">{item.title}</span>
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                sectionHasError
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : isActive
                    ? 'bg-sky-600 dark:bg-sky-400'
                    : 'bg-slate-300 dark:bg-slate-600'
              }`}
              aria-hidden="true"
            />
            {sectionHasError ? <span className="sr-only">Requiere atención</span> : null}
          </button>
        )
      })}
    </div>
  </nav>
)
