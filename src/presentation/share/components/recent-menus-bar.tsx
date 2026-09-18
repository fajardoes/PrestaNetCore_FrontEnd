import { ChevronRight, Eye, EyeOff, History } from 'lucide-react'
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
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-6 w-full max-w-screen-2xl items-center justify-end px-4 lg:px-8">
          <button
            type="button"
            title="Mostrar menús recientes"
            aria-label="Mostrar menús recientes"
            onClick={onToggleVisibility}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none dark:text-slate-500 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
          >
            <Eye className="h-3 w-3" aria-hidden="true" />
            <span>Mostrar recientes</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-7 w-full max-w-screen-2xl min-w-0 items-center px-4 lg:px-8">
        <nav
          aria-label="Menús recientes"
          className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto whitespace-nowrap text-[11px]"
        >
          <span className="inline-flex shrink-0 items-center gap-1 pr-1 font-medium text-slate-400 dark:text-slate-500">
            <History className="h-3 w-3" aria-hidden="true" />
            <span>Recientes</span>
          </span>

          {items.map((item, index) => (
            <span key={item.id} className="inline-flex shrink-0 items-center">
              {index > 0 ? (
                <ChevronRight
                  className="mx-0.5 h-3 w-3 text-slate-300/80 dark:text-slate-700"
                  aria-hidden="true"
                />
              ) : null}
              <button
                type="button"
                title={item.label}
                aria-current={activeItemId === item.id ? 'page' : undefined}
                onClick={() => onSelect(item)}
                className={[
                  'max-w-36 truncate rounded px-1.5 py-0.5 text-left transition focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none',
                  activeItemId === item.id
                    ? 'bg-slate-200/55 font-medium text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
                    : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200',
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
          className="ml-1 inline-flex shrink-0 items-center rounded border-l border-slate-200/70 pl-1.5 text-slate-400 transition hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/40 motion-reduce:transition-none dark:border-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <EyeOff className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
