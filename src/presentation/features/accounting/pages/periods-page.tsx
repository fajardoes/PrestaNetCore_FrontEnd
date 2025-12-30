import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import { usePeriods } from '@/presentation/features/accounting/hooks/use-periods'
import { useOpenPeriod } from '@/presentation/features/accounting/hooks/use-open-period'
import { useClosePeriod } from '@/presentation/features/accounting/hooks/use-close-period'
import { PeriodsTable } from '@/presentation/features/accounting/components/periods-table'
import { OpenPeriodModal } from '@/presentation/features/accounting/components/open-period-modal'
import { ClosePeriodModal } from '@/presentation/features/accounting/components/close-period-modal'
import { OpenPeriodCard } from '@/presentation/features/accounting/components/open-period-card'
import { AdvancedPeriodActions } from '@/presentation/features/accounting/components/advanced-period-actions'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { AccountingPeriodDto, AccountingPeriodState } from '@/infrastructure/interfaces/accounting/accounting-period'

export const PeriodsPage = () => {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false

  const {
    periods,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    year,
    setYear,
    periodState,
    setPeriodState,
    refresh,
    openPeriod,
    openPeriodLoading,
    openPeriodError,
    getNextPeriodPreview,
  } = usePeriods({ enabled: isAdmin })

  const [openModal, setOpenModal] = useState(false)
  const [closingPeriod, setClosingPeriod] = useState<AccountingPeriodDto | null>(null)
  const openHook = useOpenPeriod({
    onCompleted: async () => {
      setOpenModal(false)
      await refresh()
    },
  })
  const closeHook = useClosePeriod()

  const stateLabel = useMemo<Record<AccountingPeriodState | 'all', string>>(
    () => ({
      all: 'Todos',
      open: 'Abiertos',
      closed: 'Cerrados',
      locked: 'Bloqueados',
    }),
    [],
  )

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar los períodos contables.
        </p>
      </div>
    )
  }

  const handleStateChange = (value: AccountingPeriodState | 'all') => {
    setPeriodState(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Períodos
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Cierra el período vigente y el sistema abrirá automáticamente el siguiente mes.
        </p>
      </div>

      {openPeriodLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          Cargando período abierto...
        </div>
      ) : openPeriod ? (
        <OpenPeriodCard
          period={openPeriod}
          onClose={() => {
            setClosingPeriod(openPeriod)
          }}
          isClosing={closeHook.isLoading}
        />
      ) : openPeriodError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {openPeriodError}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
          No hay un período <span className="font-semibold">OPEN</span> en este momento.
        </div>
      )}

      <ListFiltersBar
        search={year?.toString() ?? ''}
        onSearchChange={(value) => {
          const trimmed = value.trim()
          const numericYear = Number(trimmed)
          if (!trimmed || Number.isNaN(numericYear)) {
            setYear(null)
          } else {
            setYear(numericYear)
          }
          setPage(1)
        }}
        placeholder="Filtrar por año fiscal..."
        status="all"
        onStatusChange={() => {
          /* status pills ocultos */
        }}
        showStatus={false}
        children={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estado
              </label>
              <select
                value={periodState}
                onChange={(event) =>
                  handleStateChange(event.target.value as AccountingPeriodState | 'all')
                }
                className="w-44 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              >
                {Object.entries(stateLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        }
        actions={
          <AdvancedPeriodActions onOpenPeriod={() => setOpenModal(true)} />
        }
      />

      <PeriodsTable
        periods={periods}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
        onClosePeriod={(period) => {
          if (period.state !== 'open') return
          setClosingPeriod(period)
        }}
      />

      <OpenPeriodModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={async (values) => {
          await openHook.openPeriod(values)
        }}
        isSubmitting={openHook.isLoading}
        error={openHook.error}
      />

      <ClosePeriodModal
        open={Boolean(closingPeriod)}
        period={closingPeriod}
        nextPeriodPreview={getNextPeriodPreview(closingPeriod)}
        onClose={() => setClosingPeriod(null)}
        onSubmit={async (values) => {
          if (!closingPeriod) return
          const result = await closeHook.mutate(closingPeriod.id, values.notes ?? undefined)
          if (result.success) {
            notify(
              `Período cerrado: ${result.data.closedPeriod.month}/${result.data.closedPeriod.fiscalYear} | Período abierto: ${result.data.openedPeriod.month}/${result.data.openedPeriod.fiscalYear}`,
              'success',
            )
            setClosingPeriod(null)
            await refresh()
          }
        }}
        isSubmitting={closeHook.isLoading}
        error={closeHook.error}
      />
    </div>
  )
}
