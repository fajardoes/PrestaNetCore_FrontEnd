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
    postingMessages[0] || 'El backend reporta que el posteo automatico no esta habilitado.'
  const closeBlockedByContext =
    postingContextHook.postingContext?.automaticPostingAllowed === false

  const actionCopy: Record<
    PeriodPostingOperation,
    { title: string; description: string; confirmLabel: string; success: string }
  > = {
    'enable-adjustments': {
      title: 'Habilitar ajustes',
      description: 'Este periodo quedara disponible para asientos de ajuste manual.',
      confirmLabel: 'Habilitar ajustes',
      success: 'Ajustes habilitados correctamente.',
    },
    'disable-adjustments': {
      title: 'Deshabilitar ajustes',
      description: 'El periodo dejara de aceptar asientos de ajuste manual.',
      confirmLabel: 'Deshabilitar ajustes',
      success: 'Ajustes deshabilitados correctamente.',
    },
    lock: {
      title: 'Bloquear periodo',
      description: 'El periodo quedara bloqueado para acciones administrativas posteriores.',
      confirmLabel: 'Bloquear periodo',
      success: 'Periodo bloqueado correctamente.',
    },
    'enable-automatic-posting': {
      title: 'Habilitar posteo automatico',
      description: 'Las operaciones automaticas podran contabilizarse en este periodo.',
      confirmLabel: 'Habilitar posteo',
      success: 'Posteo automatico habilitado correctamente.',
    },
    'disable-automatic-posting': {
      title: 'Deshabilitar posteo automatico',
      description: 'Las operaciones automaticas dejaran de contabilizarse en este periodo.',
      confirmLabel: 'Deshabilitar posteo',
      success: 'Posteo automatico deshabilitado correctamente.',
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Períodos
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Supervisa el periodo operativo resuelto desde la fecha de negocio y administra ajustes o posteo automatico por periodo.
        </p>
      </div>

      {postingContextHook.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
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
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {postingContextHook.error}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
          No fue posible resolver un periodo operativo desde la fecha de negocio actual.
        </div>
      )}

      {postingContextHook.postingContext ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900 shadow-sm dark:border-sky-900/50 dark:bg-sky-500/10 dark:text-sky-100">
          <div className="flex flex-col gap-1">
            <p className="font-semibold">
              Fecha de negocio: {formatAccountingDate(postingContextHook.postingContext.businessDate)}
            </p>
            <p>
              Periodo operativo resuelto: {getPeriodLabel(operationalPeriod)}
            </p>
            <p>
              Posteo automatico:{' '}
              {postingContextHook.postingContext.automaticPostingAllowed ? 'habilitado' : 'bloqueado'}
            </p>
          </div>
          {postingMessages.length ? (
            <div className="mt-3 space-y-1 border-t border-sky-200 pt-3 text-sm dark:border-sky-800/60">
              {postingMessages.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

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
          periodSettingsHook.setError(null)
        }}
        isApplyingAction={periodSettingsHook.isLoading}
        operationalPeriodId={operationalPeriod?.id}
        automaticPostingBlocked={closeBlockedByContext}
        automaticPostingBlockedReason={automaticPostingBlockReason}
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
        onCancel={() => {
          setPendingAction(null)
          periodSettingsHook.setError(null)
        }}
        onConfirm={async () => {
          if (!pendingAction) return
          const result = await periodSettingsHook.mutate(
            pendingAction.period.id,
            pendingAction.operation,
          )
          if (result.success) {
            notify(actionCopy[pendingAction.operation].success, 'success')
            setPendingAction(null)
            await Promise.all([refresh(), postingContextHook.refresh()])
            return
          }
          notify(result.error ?? 'No fue posible completar la accion.', 'error')
        }}
      >
        {periodSettingsHook.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {periodSettingsHook.error}
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
