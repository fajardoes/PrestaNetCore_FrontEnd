import { Link } from 'react-router-dom'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'

interface QuickAccessSectionProps {
  items: MenuItemTreeDto[]
  isLoading: boolean
  error: string | null
}

export const QuickAccessSection = ({
  items,
  isLoading,
  error,
}: QuickAccessSectionProps) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
    <div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Accesos rápidos
      </h2>
      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
        Rutas disponibles según tus menús autorizados.
      </p>
    </div>

    {isLoading ? (
      <div className="mt-3 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[68px] animate-pulse rounded-lg border border-slate-200 bg-slate-100 motion-reduce:animate-none dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    ) : null}

    {!isLoading && error ? (
      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
        {error}
      </div>
    ) : null}

    {!isLoading && !error && items.length > 0 ? (
      <div className="mt-3 grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={item.route ?? '/'}
            className="group flex min-h-[68px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 transition hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-primary/40 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-sky-700 dark:hover:bg-sky-950/20"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
              <MenuIcon iconName={item.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-900 group-hover:text-sky-800 dark:text-slate-100 dark:group-hover:text-sky-200">
                {item.title}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                {item.route}
              </span>
            </span>
          </Link>
        ))}
      </div>
    ) : null}

    {!isLoading && !error && items.length === 0 ? (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        No hay accesos rápidos disponibles para este usuario.
      </div>
    ) : null}
  </article>
)
