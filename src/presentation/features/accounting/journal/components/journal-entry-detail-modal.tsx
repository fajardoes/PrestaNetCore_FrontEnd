import { useState } from 'react'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import { JournalEntryStateBadge } from './journal-entry-state-badge'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import { JournalEntryVoucherReport } from '@/presentation/components/reports/accounting/journal-entry-voucher-report'

interface JournalEntryDetailModalProps {
  open: boolean
  entry: JournalEntryDetail | null
  isLoading: boolean
  error: string | null
  onClose: () => void
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const JournalEntryDetailModal = ({
  open,
  entry,
  isLoading,
  error,
  onClose,
}: JournalEntryDetailModalProps) => {
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const canPrint = Boolean(entry && entry.state !== 'draft')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Detalle del asiento
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Revisa la información completa del asiento seleccionado.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-print"
              onClick={() => setIsPdfOpen(true)}
              disabled={!canPrint}
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
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 md:grid-cols-3">
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
                  {entry.date}
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
              <div className="md:col-span-3">
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
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Cuenta
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Descripción
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Debe
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Haber
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Referencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {entry.lines.map((line, index) => (
                      <tr key={`${line.accountId}-${index}`}>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                          {line.accountCode
                            ? `${line.accountCode} - ${line.accountName ?? ''}`
                            : line.accountId}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                          {line.description || '—'}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-slate-700 dark:text-slate-200">
                          {formatAmount(line.debit)}
                        </td>
                        <td className="px-3 py-2 text-right text-sm text-slate-700 dark:text-slate-200">
                          {formatAmount(line.credit)}
                        </td>
                        <td className="px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                          {line.reference || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {entry ? (
        <PdfViewerDialog
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          title="Comprobante de asiento"
          document={
            <JournalEntryVoucherReport
              entry={entry}
              organizationName="PrestaNet"
            />
          }
        />
      ) : null}
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
