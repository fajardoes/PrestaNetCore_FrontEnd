import { Eye, EyeOff, History } from 'lucide-react'
import type { RecentMenuItem } from '@/types/recent-menu'

interface RecentMenusBarProps {
  items: RecentMenuItem[]
  activeItemId?: string | null
  isVisible?: boolean
  onToggleVisibility: () => void
  onSelect: (item: RecentMenuItem) => void
}

export const RecentMenusBar = ({
  items,
  activeItemId = null,
  isVisible = true,
  onToggleVisibility,
  onSelect,
}: RecentMenusBarProps) => {
  if (items.length === 0) return null

  if (!isVisible) {
    return (
      <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex h-6 w-full max-w-screen-2xl items-center justify-end px-4 lg:px-8">
          <button
            type="button"
            title="Mostrar menús recientes"
            aria-label="Mostrar menús recientes"
            onClick={onToggleVisibility}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none dark:text-slate-500 dark:hover:bg-slate-800/70 dark:hover:text-slate-300"
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span>Mostrar recientes</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex h-7 w-full max-w-screen-2xl min-w-0 items-center px-4 lg:px-8">
        <nav
          aria-label="Menús recientes"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto whitespace-nowrap text-[11px]"
        >
          <span className="inline-flex shrink-0 items-center gap-1 pr-1 font-medium text-slate-500 dark:text-slate-400">
            <History className="h-3 w-3" aria-hidden="true" />
            <span>Recientes</span>
          </span>

          {items.map((item, index) => (
            <span key={item.id} className="inline-flex shrink-0 items-center">
              {index > 0 ? (
                <span className="mx-1 text-slate-300 dark:text-slate-700" aria-hidden="true">
                  ·
                </span>
              ) : null}
              <button
                type="button"
                title={item.label}
                aria-current={activeItemId === item.id ? 'page' : undefined}
                onClick={() => onSelect(item)}
                className={[
                  'max-w-40 truncate rounded-md px-1.5 py-1 text-left transition focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none',
                  activeItemId === item.id
                    ? 'bg-sky-50 font-medium text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {item.label}
              </button>
            </span>
          ))}
        </nav>
        <button
          type="button"
          title="Ocultar menús recientes"
          aria-label="Ocultar menús recientes"
          onClick={onToggleVisibility}
          className="ml-2 inline-flex shrink-0 items-center rounded border-l border-slate-200/70 pl-2 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none dark:border-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <EyeOff className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
