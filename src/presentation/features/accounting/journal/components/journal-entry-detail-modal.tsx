import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import { JournalEntryStateBadge } from './journal-entry-state-badge'
import {
  formatAccountingAmount,
  formatAccountingDate,
  getJournalAccountingDate,
  getPostingModeLabel,
} from '@/presentation/features/accounting/accounting-ui'

interface JournalEntryDetailModalProps {
  open: boolean
  entry: JournalEntryDetail | null
  isLoading: boolean
  error: string | null
  onClose: () => void
  onPrint: (entry: JournalEntryDetail) => void
  isPrinting?: boolean
}

export const JournalEntryDetailModal = ({
  open,
  entry,
  isLoading,
  error,
  onClose,
  onPrint,
  isPrinting = false,
}: JournalEntryDetailModalProps) => {
  const canPrint = Boolean(entry && entry.state !== 'draft')
  const totals = entry?.lines.reduce(
    (summary, line) => ({
      debit: summary.debit + line.debit,
      credit: summary.credit + line.credit,
    }),
    { debit: 0, credit: 0 },
  ) ?? { debit: 0, credit: 0 }
  const difference = Math.abs(totals.debit - totals.credit)
  const isBalanced = Math.round(difference * 100) === 0

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[calc(100vh-2rem)] w-[calc(100vw-48px)] max-w-[1180px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Detalle del asiento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Revisa la información completa del asiento seleccionado.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              className="btn-print"
              onClick={() => {
                if (entry) onPrint(entry)
              }}
              disabled={!canPrint || isPrinting}
              aria-busy={isPrinting}
            >
              <PrinterIcon className="h-4 w-4" />
              Imprimir comprobante
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-icon"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Cargando detalle del asiento...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : entry ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-x-5 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Número
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {entry.number || '—'}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Fecha
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatAccountingDate(getJournalAccountingDate(entry))}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Estado
                </span>
                <div className="mt-1">
                  <JournalEntryStateBadge state={entry.state} />
                </div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Tipo de posteo
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {getPostingModeLabel(entry.postingMode)}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Fecha del evento
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatAccountingDate(entry.eventDate)}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Fecha de negocio
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {formatAccountingDate(entry.businessDateSnapshot)}
                </p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Periodo de posteo
                </span>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {entry.postingPeriodName || entry.periodName || '—'}
                </p>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  Descripción
                </span>
                <p className="text-slate-800 dark:text-slate-100">
                  {entry.description}
                </p>
              </div>
            </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                  <table className="min-w-[1120px] w-full table-fixed divide-y divide-slate-200 dark:divide-slate-800">
                    <colgroup>
                      <col className="w-[22%]" />
                      <col className="w-[19%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[18%]" />
                      <col className="w-[17%]" />
                    </colgroup>
                    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300 [&_th]:whitespace-nowrap">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Cuenta
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Descripción
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider tabular-nums text-slate-600 dark:text-slate-300">
                          Debe
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider tabular-nums text-slate-600 dark:text-slate-300">
                          Haber
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Referencia
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Centro de costo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {entry.lines.map((line, index) => (
                        <tr
                          key={`${line.accountId}-${index}`}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60"
                        >
                          <td className="px-3 py-2 align-middle text-xs text-slate-700 dark:text-slate-200">
                            {line.accountCode ? (
                              <div className="min-w-0">
                                <div className="font-mono text-[11px] font-semibold leading-4 text-slate-800 dark:text-slate-100">
                                  {line.accountCode}
                                </div>
                                <div className="truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                                  {line.accountName || line.accountId}
                                </div>
                              </div>
                            ) : (
                              <span className="font-mono text-[11px]">{line.accountId}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 align-middle text-xs leading-4 text-slate-700 dark:text-slate-200">
                            {line.description || '—'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right align-middle text-xs tabular-nums text-slate-700 dark:text-slate-200">
                            {formatAccountingAmount(line.debit)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-right align-middle text-xs tabular-nums text-slate-700 dark:text-slate-200">
                            {formatAccountingAmount(line.credit)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 align-middle font-mono text-[11px] text-slate-700 dark:text-slate-200">
                            {line.reference || '—'}
                          </td>
                          <td className="px-3 py-2 align-middle text-xs text-slate-700 dark:text-slate-200">
                            {line.costCenterCode || line.costCenterName ? (
                              <div className="min-w-0">
                                {line.costCenterCode ? (
                                  <div className="font-mono text-[11px] font-semibold leading-4 text-slate-800 dark:text-slate-100">
                                    {line.costCenterCode}
                                  </div>
                                ) : null}
                                {line.costCenterName ? (
                                  <div className="truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                                    {line.costCenterName}
                                  </div>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400">Sin centro</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-t border-slate-200 bg-slate-50/70 px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex items-baseline gap-2 text-slate-600 dark:text-slate-300">
                    <span>Total Debe</span>
                    <strong className="tabular-nums text-slate-900 dark:text-slate-100">
                      {formatAccountingAmount(totals.debit)}
                    </strong>
                  </div>
                  <div className="flex items-baseline gap-2 text-slate-600 dark:text-slate-300">
                    <span>Total Haber</span>
                    <strong className="tabular-nums text-slate-900 dark:text-slate-100">
                      {formatAccountingAmount(totals.credit)}
                    </strong>
                  </div>
                  <div
                    className={`flex items-baseline gap-2 rounded-md px-2 py-1 font-semibold ${
                      isBalanced
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                    }`}
                    role="status"
                    aria-label={isBalanced ? 'Asiento cuadrado' : 'Asiento con diferencia'}
                  >
                    <span>Diferencia</span>
                    <strong className="tabular-nums">
                      {formatAccountingAmount(difference)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

    </div>
  )
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

const PrinterIcon = ({ className }: { className?: string }) => (
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
    <path d="M6 9V4h12v5" />
    <path d="M6 18h12v2H6z" />
    <path d="M6 14h12v4H6z" />
    <path d="M4 12h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2Z" />
  </svg>
)
