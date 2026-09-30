import { Link } from 'react-router-dom'
import type { RecentMenuItem } from '@/types/recent-menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'

interface RecentNavigationSectionProps {
  items: RecentMenuItem[]
  onSelect: (item: RecentMenuItem) => void
}

export const RecentNavigationSection = ({
  items,
  onSelect,
}: RecentNavigationSectionProps) => (
  <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5">
    <div>
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
        Visitados recientemente
      </h2>
      <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
        Tus últimos módulos autorizados.
      </p>
    </div>

    {items.length > 0 ? (
      <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
        {items.slice(0, 8).map((item) => (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => onSelect(item)}
            className="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:border-sky-300 group-hover:text-sky-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:group-hover:border-sky-700 dark:group-hover:text-sky-300 motion-reduce:transition-none">
              <MenuIcon iconName={item.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                {item.label}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-slate-400">
                {item.parentLabel ?? 'Módulo'} <span aria-hidden="true">·</span>{' '}
                {formatRelativeTime(item.visitedAt)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    ) : (
      <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        Aún no has visitado otros módulos.
      </p>
    )}
  </article>
)

const formatRelativeTime = (visitedAt: number) => {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - visitedAt) / 1000))
  if (elapsedSeconds < 60) return 'ahora'

  const elapsedMinutes = Math.floor(elapsedSeconds / 60)
  if (elapsedMinutes < 60) return `hace ${elapsedMinutes} min`

  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `hace ${elapsedHours} h`

  const elapsedDays = Math.floor(elapsedHours / 24)
  return elapsedDays === 1 ? 'ayer' : `hace ${elapsedDays} días`
}
