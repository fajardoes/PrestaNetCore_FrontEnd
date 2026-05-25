import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import type { PeriodPostingOperation } from '@/core/actions/accounting/update-period-posting-settings.action'
import { getPeriodLabel } from '@/presentation/features/accounting/accounting-ui'

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
  automaticPostingBlocked = false,
  automaticPostingBlockedReason,
}: PeriodsTableProps) => {
  const columns = [
    {
      key: 'period',
      header: 'Periodo',
      className: 'min-w-[135px]',
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
      className: 'min-w-[115px]',
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
      header: 'Capacidades',
      className: 'min-w-[310px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            period.allowAutomaticPosting
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
          }`}>
            Automatico {period.allowAutomaticPosting ? 'si' : 'no'}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            period.allowManualPosting
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
          }`}>
            Manual {period.allowManualPosting ? 'si' : 'no'}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            period.allowAdjustments
              ? 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40'
              : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
          }`}>
            Ajustes {period.allowAdjustments ? 'si' : 'no'}
          </span>
        </span>
      ),
    },
    {
      key: 'summary',
      header: 'Resumen',
      className: 'w-[245px] min-w-[245px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex w-[225px] flex-col gap-1 whitespace-normal text-xs text-slate-500 dark:text-slate-400">
          <span className="break-words">{period.postingSummary || 'Sin resumen de posteo.'}</span>
          <span>
            Abierto: {period.openedAt ? new Date(period.openedAt).toLocaleDateString() : '—'}
          </span>
          <span>
            Cerrado: {period.closedAt ? new Date(period.closedAt).toLocaleDateString() : '—'}
          </span>
        </span>
      ),
      getTitle: (period: AccountingPeriodDto) => period.postingSummary || 'Sin resumen de posteo.',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[410px]',
      render: (period: AccountingPeriodDto) => (
        <span className="flex flex-wrap justify-end gap-2">
          {period.state === 'open' && onClosePeriod ? (
            <button
              type="button"
              onClick={() => onClosePeriod(period)}
              className="btn-table-action"
              disabled={
                isApplyingAction ||
                (automaticPostingBlocked && period.id === operationalPeriodId)
              }
              title={
                automaticPostingBlocked && period.id === operationalPeriodId
                  ? automaticPostingBlockedReason
                  : undefined
              }
            >
              Cerrar
            </button>
          ) : null}
          {onRowAction ? (
            <button
              type="button"
              onClick={() =>
                onRowAction(
                  period,
                  period.allowAdjustments
                    ? 'disable-adjustments'
                    : 'enable-adjustments',
                )
              }
              className="btn-table-action"
              disabled={isApplyingAction}
            >
              {period.allowAdjustments ? 'Quitar ajustes' : 'Habilitar ajustes'}
            </button>
          ) : null}
          {onRowAction ? (
            <button
              type="button"
              onClick={() =>
                onRowAction(
                  period,
                  period.allowAutomaticPosting
                    ? 'disable-automatic-posting'
                    : 'enable-automatic-posting',
                )
              }
              className="btn-table-action"
              disabled={isApplyingAction || Boolean(period.isLocked)}
              title={period.isLocked ? 'El periodo esta bloqueado para acciones de posteo.' : undefined}
            >
              {period.allowAutomaticPosting ? 'Bloquear automatico' : 'Habilitar automatico'}
            </button>
          ) : null}
          {!period.isLocked && onRowAction ? (
            <button
              type="button"
              onClick={() => onRowAction(period, 'lock')}
              className="btn-table-action border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-600/60 dark:text-amber-100 dark:hover:bg-amber-500/10"
              disabled={isApplyingAction}
            >
              Bloquear
            </button>
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
