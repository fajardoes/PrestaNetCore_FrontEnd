import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { httpActivityTracker } from '@/infrastructure/api/httpActivityTracker'

const useHttpActivity = () => {
  return useSyncExternalStore(
    httpActivityTracker.subscribe,
    httpActivityTracker.getSnapshot,
    httpActivityTracker.getSnapshot,
  )
}

export const GlobalLoadingIndicator = () => {
  const { activeRequests } = useHttpActivity()

  if (activeRequests === 0 || typeof document === 'undefined') {
    return null
  }

  const visibleDots = Math.min(activeRequests, 5)
  const remaining = Math.max(activeRequests - visibleDots, 0)

  const label =
    activeRequests === 1
      ? 'Procesando...'
      : `Procesando ${activeRequests} operaciones con el backend...`

  const dots = Array.from({ length: visibleDots })

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4">
      <div
        className="flex max-w-md items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-1.5">
          {dots.map((_, index) => (
            <span
              key={`loader-dot-${index}`}
              className="h-2.5 w-2.5 rounded-full bg-sky-500/90 animate-bounce dark:bg-sky-300/90"
              style={{ animationDelay: `${index * 120}ms` }}
            />
          ))}
          {remaining > 0 ? (
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-300">
              +{remaining}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Cargando...
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
