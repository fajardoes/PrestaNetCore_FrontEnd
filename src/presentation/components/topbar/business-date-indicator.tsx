import { useEffect, useMemo, useState } from 'react'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'

const formatLocalDateTime = (value?: string) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('es-HN')
}

export const BusinessDateIndicator = () => {
  const { state, isLoading, error } = useBusinessDate()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!state?.serverLocalNow) return
    const interval = window.setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [state?.serverLocalNow])

  const liveLocalTime = useMemo(() => {
    if (!state?.serverLocalNow) return undefined
    const base = new Date(state.serverLocalNow)
    if (Number.isNaN(base.getTime())) return state.serverLocalNow
    const now = Date.now()
    const offset = now - base.getTime()
    const live = new Date(base.getTime() + offset)
    return formatLocalDateTime(live.toISOString())
  }, [state?.serverLocalNow, tick])

  const tooltip = useMemo(() => {
    if (!state) return undefined
    const localTime = liveLocalTime ?? formatLocalDateTime(state.serverLocalNow)
    return `Hora servidor: ${localTime}\nZona: ${state.timeZone}`
  }, [state, liveLocalTime])

  if (isLoading && !state) {
    return (
      <div className="hidden rounded-xl border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 md:block">
        Cargando fecha...
      </div>
    )
  }

  if (error || !state) {
    return (
      <div className="hidden rounded-xl border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-400 md:block">
        Fecha no disponible
      </div>
    )
  }

  const statusStyles = state.isDayOpen
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200'
    : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200'

  return (
    <div
      className="hidden rounded-xl border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 md:block"
      title={tooltip}
    >
      <div className="flex items-center gap-2">
        <span className="text-slate-500 dark:text-slate-400">Fecha operativa:</span>
        <span className="font-semibold">{state.businessDate}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles}`}>
          {state.isDayOpen ? 'Abierto' : 'Cerrado'}
        </span>
      </div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400">
        Hora local: {liveLocalTime ?? formatLocalDateTime(state.serverLocalNow)}
      </div>
    </div>
  )
}
