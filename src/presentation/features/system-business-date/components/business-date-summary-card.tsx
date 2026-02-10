import { useEffect, useMemo, useState } from 'react'
import type { BusinessDateStateDto } from '@/infrastructure/interfaces/system/business-date-state.dto'

interface BusinessDateSummaryCardProps {
  state: BusinessDateStateDto | null
  isLoading?: boolean
}

const formatDate = (value?: string) => {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('es-HN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const BusinessDateSummaryCard = ({
  state,
  isLoading,
}: BusinessDateSummaryCardProps) => {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!state?.serverLocalNow && !state?.serverUtcNow) return
    const interval = window.setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [state?.serverLocalNow, state?.serverUtcNow])

  const liveLocalTime = useMemo(() => {
    if (!state?.serverLocalNow) return undefined
    const base = new Date(state.serverLocalNow)
    if (Number.isNaN(base.getTime())) return state.serverLocalNow
    const offset = Date.now() - base.getTime()
    const live = new Date(base.getTime() + offset)
    return formatDateTime(live.toISOString())
  }, [state?.serverLocalNow, tick])

  const liveUtcTime = useMemo(() => {
    if (!state?.serverUtcNow) return undefined
    const base = new Date(state.serverUtcNow)
    if (Number.isNaN(base.getTime())) return state.serverUtcNow
    const offset = Date.now() - base.getTime()
    const live = new Date(base.getTime() + offset)
    return formatDateTime(live.toISOString())
  }, [state?.serverUtcNow, tick])

  if (isLoading && !state) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando fecha operativa...
      </div>
    )
  }

  const isOpen = state?.isDayOpen ?? false
  const statusLabel = isOpen ? 'Abierto' : 'Cerrado'
  const statusStyles = isOpen
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Fecha operativa
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
            {state ? formatDate(state.businessDate) : '—'}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles}`}
        >
          Día {statusLabel}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Servidor local
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {state ? (liveLocalTime ?? formatDateTime(state.serverLocalNow)) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Servidor UTC
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {state ? (liveUtcTime ?? formatDateTime(state.serverUtcNow)) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Zona horaria
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {state?.timeZone ?? '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
