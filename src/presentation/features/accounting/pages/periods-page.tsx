import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import { usePeriods } from '@/presentation/features/accounting/hooks/use-periods'
import { useOpenPeriod } from '@/presentation/features/accounting/hooks/use-open-period'
import { useClosePeriod } from '@/presentation/features/accounting/hooks/use-close-period'
import { usePostingContext } from '@/presentation/features/accounting/hooks/use-posting-context'
import { usePeriodPostingSettings } from '@/presentation/features/accounting/hooks/use-period-posting-settings'
import { PeriodsTable } from '@/presentation/features/accounting/components/periods-table'
import { OpenPeriodModal } from '@/presentation/features/accounting/components/open-period-modal'
import { ClosePeriodModal } from '@/presentation/features/accounting/components/close-period-modal'
import { OpenPeriodCard } from '@/presentation/features/accounting/components/open-period-card'
import { AdvancedPeriodActions } from '@/presentation/features/accounting/components/advanced-period-actions'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import AsyncSelect from '@/presentation/share/components/async-select'
import type { AccountingPeriodDto, AccountingPeriodState } from '@/infrastructure/interfaces/accounting/accounting-period'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { formatAccountingDate, getPeriodLabel, getPostingContextMessages } from '@/presentation/features/accounting/accounting-ui'
import type { PeriodPostingOperation } from '@/core/actions/accounting/update-period-posting-settings.action'

interface PendingPeriodAction {
  period: AccountingPeriodDto
  operation: PeriodPostingOperation
}

interface PeriodMonth {
  fiscalYear: number
  month: number
}

const isWithinNormalPostingWindow = (period: PeriodMonth, businessDate?: string | null) => {
  if (!businessDate) return false
  const [year, month] = businessDate.split('-').map(Number)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return false
  }

  const next = month === 12 ? { fiscalYear: year + 1, month: 1 } : { fiscalYear: year, month: month + 1 }
  return (period.fiscalYear === year && period.month === month) ||
    (period.fiscalYear === next.fiscalYear && period.month === next.month)
}

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
    getNextPeriodPreview,
  } = usePeriods({ enabled: isAdmin })
  const postingContextHook = usePostingContext({ enabled: isAdmin })
  const periodSettingsHook = usePeriodPostingSettings()

  const [openModal, setOpenModal] = useState(false)
  const [closingPeriod, setClosingPeriod] = useState<AccountingPeriodDto | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingPeriodAction | null>(null)
  const [unlockReason, setUnlockReason] = useState('')
  const openHook = useOpenPeriod({
    onCompleted: async () => {
      setOpenModal(false)
      await Promise.all([refresh(), postingContextHook.refresh()])
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
  const periodStateOptions = useMemo(
    () =>
      Object.entries(stateLabel).map(([value, label]) => ({
        value,
        label,
      })),
    [stateLabel],
  )
  const loadPeriodStateOptions = async (inputValue: string) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return periodStateOptions
    return periodStateOptions.filter((option) =>
      option.label.toLowerCase().includes(term),
    )
  }

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

  const postingMessages = getPostingContextMessages(postingContextHook.postingContext)
  const operationalPeriod =
    postingContextHook.postingContext?.operationalPeriodResolvedFromBusinessDate ?? null
  const automaticPostingBlockReason =
    postingMessages[0] || 'El sistema reporta que el posteo automático no está habilitado.'
  const closeBlockedByContext =
    postingContextHook.postingContext?.automaticPostingAllowed === false
  const closingPeriodNextPreview = getNextPeriodPreview(closingPeriod)
  const canEnableClosingPeriodNext = Boolean(
    closingPeriodNextPreview &&
    isWithinNormalPostingWindow(
      closingPeriodNextPreview,
      postingContextHook.postingContext?.businessDate,
    ),
  )

  const actionCopy: Record<
    PeriodPostingOperation,
    { title: string; description: string; confirmLabel: string; success: string }
  > = {
    'enable-adjustments': {
      title: 'Habilitar ajustes',
      description: 'Este período quedará disponible para asientos de ajuste manual.',
      confirmLabel: 'Habilitar ajustes',
      success: 'Ajustes habilitados correctamente.',
    },
    'disable-adjustments': {
      title: 'Deshabilitar ajustes',
      description: 'El período dejará de aceptar asientos de ajuste manual.',
      confirmLabel: 'Deshabilitar ajustes',
      success: 'Ajustes deshabilitados correctamente.',
    },
    lock: {
      title: 'Bloquear período',
      description: 'El período quedará bloqueado y sin posteo. Se podrá retirar el bloqueo después indicando un motivo; al desbloquearlo permanecerá cerrado hasta habilitarlo de forma explícita.',
      confirmLabel: 'Bloquear período',
      success: 'Período bloqueado correctamente.',
    },
    unlock: {
      title: 'Desbloquear período',
      description: 'El período quedará cerrado y sin capacidades de posteo. Para volver a habilitar operaciones, usa después la acción correspondiente; se aplicarán las reglas de secuencia contable.',
      confirmLabel: 'Desbloquear período',
      success: 'Período desbloqueado y dejado cerrado.',
    },
    'enable-automatic-posting': {
      title: 'Habilitar posteo automático',
      description: 'Las operaciones automáticas podrán contabilizarse en este período.',
      confirmLabel: 'Habilitar posteo',
      success: 'Posteo automático habilitado correctamente.',
    },
    'disable-automatic-posting': {
      title: 'Deshabilitar posteo automático',
      description: 'Las operaciones automáticas dejarán de contabilizarse en este período.',
      confirmLabel: 'Deshabilitar posteo',
      success: 'Posteo automático deshabilitado correctamente.',
    },
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
          Contabilidad
        </p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Períodos contables
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Consulta el período operativo y administra las capacidades de posteo de cada mes.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        {postingContextHook.isLoading ? (
          <div className="flex min-h-28 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            Cargando contexto operativo contable...
          </div>
        ) : operationalPeriod ? (
          <OpenPeriodCard
            period={operationalPeriod}
            businessDate={postingContextHook.postingContext?.businessDate}
            automaticPostingAllowed={postingContextHook.postingContext?.automaticPostingAllowed}
            onClose={() => {
              setClosingPeriod(operationalPeriod)
            }}
            isClosing={closeHook.isLoading}
            disableClose={closeBlockedByContext}
            disableCloseReason={closeBlockedByContext ? automaticPostingBlockReason : undefined}
          />
        ) : postingContextHook.error ? (
          <div className="flex min-h-28 items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {postingContextHook.error}
          </div>
        ) : (
          <div className="flex min-h-28 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            No fue posible resolver un período operativo desde la fecha de negocio actual.
          </div>
        )}

        {postingContextHook.postingContext ? (
          <div className="flex flex-col justify-center rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm dark:border-sky-900/50 dark:bg-sky-500/10">
            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">
                  Fecha de negocio
                </p>
                <p className="mt-0.5 text-sm font-semibold text-sky-950 dark:text-sky-50">
                  {formatAccountingDate(postingContextHook.postingContext.businessDate)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">
                  Período operativo
                </p>
                <p className="mt-0.5 text-sm font-semibold text-sky-950 dark:text-sky-50">
                  {getPeriodLabel(operationalPeriod)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200">
                  Posteo automático
                </p>
                <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                  postingContextHook.postingContext.automaticPostingAllowed
                    ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-100 dark:ring-sky-500/40'
                    : 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40'
                }`}>
                  {postingContextHook.postingContext.automaticPostingAllowed ? 'Habilitado' : 'Bloqueado'}
                </span>
              </div>
            </div>
            {postingMessages.length ? (
              <div className="mt-3 space-y-1 border-t border-sky-200 pt-3 text-xs leading-5 text-sky-900 dark:border-sky-800/60 dark:text-sky-100">
                {postingMessages.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

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
              <div className="w-44">
                <AsyncSelect
                  value={
                    periodStateOptions.find((option) => option.value === periodState) ??
                    null
                  }
                  onChange={(option) =>
                    handleStateChange(
                      (option?.value as AccountingPeriodState | 'all') ?? 'all',
                    )
                  }
                  loadOptions={loadPeriodStateOptions}
                  defaultOptions={periodStateOptions}
                  isClearable={false}
                  noOptionsMessage="Sin estados"
                  instanceId="accounting-periods-state-filter"
                />
              </div>
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
        onRowAction={(period, operation) => {
          setPendingAction({ period, operation })
          setUnlockReason('')
          periodSettingsHook.setError(null)
        }}
        isApplyingAction={periodSettingsHook.isLoading}
        operationalPeriodId={operationalPeriod?.id}
        businessDate={postingContextHook.postingContext?.businessDate}
        automaticPostingBlocked={closeBlockedByContext}
        automaticPostingBlockedReason={automaticPostingBlockReason}
      />

      <OpenPeriodModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={async (values) => {
          await openHook.openPeriod(values)
        }}
        businessDate={postingContextHook.postingContext?.businessDate}
        businessDateLoading={postingContextHook.isLoading}
        businessDateError={postingContextHook.error}
        isSubmitting={openHook.isLoading}
        error={openHook.error}
      />

      <ClosePeriodModal
        open={Boolean(closingPeriod)}
        period={closingPeriod}
        nextPeriodPreview={closingPeriodNextPreview}
        canEnableNextPeriod={canEnableClosingPeriodNext}
        onClose={() => setClosingPeriod(null)}
        onSubmit={async (values) => {
          if (!closingPeriod) return
          const result = await closeHook.mutate(closingPeriod.id, values.notes ?? undefined)
          if (result.success) {
            const closedLabel = `${result.data.closedPeriod.fiscalYear}-${String(result.data.closedPeriod.month).padStart(2, '0')}`
            const openedLabel = result.data.openedPeriod
              ? ` Se habilitó ${result.data.openedPeriod.fiscalYear}-${String(result.data.openedPeriod.month).padStart(2, '0')}.`
              : ''
            notify(`Período ${closedLabel} cerrado.${openedLabel}`, 'success')
            setClosingPeriod(null)
            await Promise.all([refresh(), postingContextHook.refresh()])
          }
        }}
        isSubmitting={closeHook.isLoading}
        error={closeHook.error}
      />

      <ConfirmModal
        open={Boolean(pendingAction)}
        title={pendingAction ? actionCopy[pendingAction.operation].title : ''}
        description={pendingAction ? actionCopy[pendingAction.operation].description : ''}
        confirmLabel={pendingAction ? actionCopy[pendingAction.operation].confirmLabel : 'Confirmar'}
        isProcessing={periodSettingsHook.isLoading}
        confirmDisabled={pendingAction?.operation === 'unlock' && !unlockReason.trim()}
        onCancel={() => {
          setPendingAction(null)
          setUnlockReason('')
          periodSettingsHook.setError(null)
        }}
        onConfirm={async () => {
          if (!pendingAction) return
          const result = await periodSettingsHook.mutate(
            pendingAction.period.id,
            pendingAction.operation,
            pendingAction.operation === 'unlock' ? unlockReason.trim() : undefined,
          )
          if (result.success) {
            notify(actionCopy[pendingAction.operation].success, 'success')
            setPendingAction(null)
            setUnlockReason('')
            await Promise.all([refresh(), postingContextHook.refresh()])
            return
          }
          notify(result.error ?? 'No fue posible completar la acción.', 'error')
        }}
      >
        {pendingAction?.operation === 'unlock' ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Motivo del desbloqueo <span className="text-red-600">*</span>
            </span>
            <textarea
              value={unlockReason}
              onChange={(event) => setUnlockReason(event.target.value)}
              maxLength={488}
              rows={3}
              required
              placeholder="Explica por qué se debe retirar el bloqueo."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        ) : null}
        {periodSettingsHook.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {periodSettingsHook.error}
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
