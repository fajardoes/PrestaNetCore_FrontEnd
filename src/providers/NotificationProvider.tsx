import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type NotificationKind = 'info' | 'success' | 'warning' | 'error'

interface Notification {
  id: number
  message: string
  type: NotificationKind
}

interface NotificationContextValue {
  notify: (message: string, type?: NotificationKind, durationMs?: number) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const counter = useRef(0)

  const remove = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback(
    (message: string, type: NotificationKind = 'info', durationMs = 4500) => {
      const id = ++counter.current
      setNotifications((prev) => [...prev, { id, message, type }])
      if (durationMs > 0) {
        window.setTimeout(() => remove(id), durationMs)
      }
    },
    [remove],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 p-4">
        {notifications.map((notification) => {
          const color =
            notification.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/60 dark:bg-emerald-700 dark:text-emerald-50'
              : notification.type === 'warning'
                ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-700 dark:text-amber-50'
                : notification.type === 'error'
                  ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-500/60 dark:bg-red-800 dark:text-red-50'
                  : 'border-slate-200 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-50'
          return (
            <div
              key={notification.id}
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg shadow-black/10 ${color}`}
            >
              <div className="flex-1">{notification.message}</div>
              <button
                type="button"
                onClick={() => remove(notification.id)}
                className="btn-icon"
                aria-label="Cerrar notificación"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider')
  }
  return ctx
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
