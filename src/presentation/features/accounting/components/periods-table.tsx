import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TableActionButton } from '@/presentation/share/components/table-action-button'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import type { PeriodPostingOperation } from '@/core/actions/accounting/update-period-posting-settings.action'
import { getPeriodLabel } from '@/presentation/features/accounting/accounting-ui'
import { Check, Minus } from 'lucide-react'

interface PeriodsTableProps {
  periods: AccountingPeriodDto[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onClosePeriod?: (period: AccountingPeriodDto) => void
  onRowAction?: (period: AccountingPeriodDto, operation: PeriodPostingOperation) => void
  isApplyingAction?: boolean
  operationalPeriodId?: string
  businessDate?: string | null
  automaticPostingBlocked?: boolean
  automaticPostingBlockedReason?: string
}

const monthNames = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

const PERIODS_PAGE_SIZE = 12

const parsePeriodDate = (value: string) => {
  const [fiscalYear, month] = value.split('-').map(Number)
  if (!Number.isInteger(fiscalYear) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null
  }
  return { fiscalYear, month }
}

const getNextMonth = (fiscalYear: number, month: number) =>
  month === 12 ? { fiscalYear: fiscalYear + 1, month: 1 } : { fiscalYear, month: month + 1 }

const comparePeriods = (
  left: Pick<AccountingPeriodDto, 'fiscalYear' | 'month'>,
  right: Pick<AccountingPeriodDto, 'fiscalYear' | 'month'>,
) => left.fiscalYear - right.fiscalYear || left.month - right.month

interface CapabilityBadgeProps {
  label: string
  enabled: boolean
  tone?: 'primary' | 'warning'
}

const CapabilityBadge = ({ label, enabled, tone = 'primary' }: CapabilityBadgeProps) => {
  const enabledClassName = tone === 'warning'
    ? 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40'
    : 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
  const disabledClassName =
    'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
  const Icon = enabled ? Check : Minus

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${enabled ? enabledClassName : disabledClassName}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{label}</span>
      <span className="font-medium">{enabled ? 'Sí' : 'No'}</span>
    </span>
  )
}

export const PeriodsTable = ({
  periods,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onClosePeriod,
  onRowAction,
  isApplyingAction = false,
  operationalPeriodId,
  businessDate,
  automaticPostingBlocked = false,
  automaticPostingBlockedReason,
}: PeriodsTableProps) => {
  const businessPeriod = businessDate ? parsePeriodDate(businessDate) : null
  const nextBusinessPeriod = businessPeriod
    ? getNextMonth(businessPeriod.fiscalYear, businessPeriod.month)
    : null
  const isBeforeBusinessPeriod = (period: AccountingPeriodDto) =>
    businessPeriod !== null && comparePeriods(period, businessPeriod) < 0
  const isAfterBusinessPeriod = (period: AccountingPeriodDto) =>
    businessPeriod !== null && comparePeriods(period, businessPeriod) > 0
  const canEnableNormalPosting = (period: AccountingPeriodDto) =>
    businessPeriod !== null && nextBusinessPeriod !== null &&
    (comparePeriods(period, businessPeriod) === 0 || comparePeriods(period, nextBusinessPeriod) === 0)

  const columns = [
    {
      key: 'period',
      header: 'Período',
      className: 'min-w-[140px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex flex-col gap-1 font-semibold text-slate-800 dark:text-slate-100">
          <span>{getPeriodLabel(period)}</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {monthNames[period.month - 1] ?? `Mes ${period.month}`}
          </span>
        </span>
      ),
      getTitle: (period: AccountingPeriodDto) =>
        `${getPeriodLabel(period)} - ${monthNames[period.month - 1] ?? `Mes ${period.month}`}`,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'min-w-[125px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex flex-col items-start gap-1">
          <AccountingStatusBadge state={period.state} />
          {period.id === operationalPeriodId ? (
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40">
              Operativo
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: 'capabilities',
      header: 'Permisos de posteo',
      className: 'min-w-[280px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex flex-wrap gap-1.5">
          <CapabilityBadge label="Automático" enabled={Boolean(period.allowAutomaticPosting)} />
          <CapabilityBadge label="Manual" enabled={Boolean(period.allowManualPosting)} />
          <CapabilityBadge label="Ajustes" enabled={Boolean(period.allowAdjustments)} tone="warning" />
        </span>
      ),
    },
    {
      key: 'summary',
      header: 'Resumen',
      className: 'w-[230px] min-w-[230px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex w-[210px] flex-col gap-1 whitespace-normal text-xs text-slate-500 dark:text-slate-400">
          <span className="break-words text-slate-700 dark:text-slate-200">{period.postingSummary || 'Sin resumen de posteo.'}</span>
          <span>
            Abierto: {period.openedAt ? new Date(period.openedAt).toLocaleDateString('es-HN') : '—'}
          </span>
          <span>
            Cerrado: {period.closedAt ? new Date(period.closedAt).toLocaleDateString('es-HN') : '—'}
          </span>
        </span>
      ),
      getTitle: (period: AccountingPeriodDto) => period.postingSummary || 'Sin resumen de posteo.',
    },
    {
      key: 'period-actions',
      header: 'Acciones',
      className: 'w-[160px] min-w-[160px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex flex-nowrap justify-end gap-1">
          {period.state === 'open' && onClosePeriod ? (
            <TableActionButton
              icon="lock"
              label="Cerrar período"
              onClick={() => onClosePeriod(period)}
              disabled={
                isApplyingAction ||
                !businessPeriod ||
                isAfterBusinessPeriod(period) ||
                (automaticPostingBlocked && period.id === operationalPeriodId)
              }
              tooltip={
                !businessPeriod
                  ? 'No se pudo resolver la fecha operativa.'
                  : isAfterBusinessPeriod(period)
                    ? 'No se puede cerrar un período posterior al mes de la fecha operativa.'
                    : automaticPostingBlocked && period.id === operationalPeriodId
                      ? automaticPostingBlockedReason
                      : undefined
              }
            />
          ) : null}
          {!period.isLocked && onRowAction ? (
            <TableActionButton
              icon="toggle"
              label={period.allowAdjustments ? 'Quitar ajustes' : 'Habilitar ajustes'}
              onClick={() =>
                onRowAction(
                  period,
                  period.allowAdjustments
                    ? 'disable-adjustments'
                    : 'enable-adjustments',
                )
              }
              disabled={isApplyingAction || (!period.allowAdjustments && !isBeforeBusinessPeriod(period))}
              tooltip={
                !period.allowAdjustments && !isBeforeBusinessPeriod(period)
                  ? 'Los ajustes solo se habilitan en períodos anteriores al mes operativo.'
                  : undefined
              }
            />
          ) : null}
          {!period.isLocked && onRowAction ? (
            <TableActionButton
              icon="toggle"
              label={period.allowAutomaticPosting ? 'Bloquear automático' : 'Habilitar automático'}
              onClick={() =>
                onRowAction(
                  period,
                  period.allowAutomaticPosting
                    ? 'disable-automatic-posting'
                    : 'enable-automatic-posting',
                )
              }
              disabled={
                isApplyingAction ||
                Boolean(period.isLocked) ||
                (!period.allowAutomaticPosting && !canEnableNormalPosting(period))
              }
              tooltip={
                period.isLocked
                  ? 'El período está bloqueado para acciones de posteo.'
                  : !period.allowAutomaticPosting && !canEnableNormalPosting(period)
                    ? 'Solo se puede habilitar el período operativo o el mes inmediatamente siguiente.'
                    : undefined
              }
            />
          ) : null}
          {!period.isLocked && onRowAction ? (
            <TableActionButton
              icon="lock"
              label="Bloquear período"
              onClick={() => onRowAction(period, 'lock')}
              className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-600/60 dark:text-amber-100 dark:hover:bg-amber-500/10"
              disabled={isApplyingAction}
            />
          ) : null}
          {period.isLocked && onRowAction ? (
            <TableActionButton
              icon="toggle"
              label="Desbloquear período"
              onClick={() => onRowAction(period, 'unlock')}
              disabled={isApplyingAction}
              className="border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-600/60 dark:text-amber-100 dark:hover:bg-amber-500/10"
            />
          ) : null}
          {!period.state || (period.isLocked && !onClosePeriod && !onRowAction) ? (
            <span className="text-xs text-slate-500 dark:text-slate-400">—</span>
          ) : null}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <TableTabular
        title="Períodos contables"
        columns={columns}
        rows={periods}
        rowKey={(period) => period.id}
        isLoading={isLoading}
        loadingMessage="Cargando períodos contables..."
        emptyMessage={error ? 'No fue posible cargar los períodos contables.' : 'No hay períodos para los filtros seleccionados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * PERIODS_PAGE_SIZE + 1}
      />

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  )
}
