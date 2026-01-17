import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'

interface JournalEntryPostModalProps {
  open: boolean
  entry: JournalEntryDetail | null
  isLoading: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const JournalEntryPostModal = ({
  open,
  entry,
  isLoading,
  error,
  onClose,
  onConfirm,
}: JournalEntryPostModalProps) => {
  if (!open) return null

  const hasDifference = Boolean(entry && entry.totalDebit !== entry.totalCredit)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Confirmar contabilización
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Revisa los datos del asiento antes de contabilizarlo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {isLoading ? (
              <p>Cargando asiento...</p>
            ) : entry ? (
              <div className="grid gap-2 md:grid-cols-2">
                <p>
                  <span className="font-semibold">Número:</span> {entry.number || '—'}
                </p>
                <p>
                  <span className="font-semibold">Fecha:</span> {entry.date}
                </p>
                <p className="md:col-span-2">
                  <span className="font-semibold">Descripción:</span> {entry.description}
                </p>
                <div className="flex items-center gap-3 md:col-span-2">
                  <span className="text-slate-600 dark:text-slate-300">
                    Total Debe: <strong>{formatAmount(entry.totalDebit)}</strong>
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Total Haber: <strong>{formatAmount(entry.totalCredit)}</strong>
                  </span>
                  <span
                    className={
                      hasDifference
                        ? 'text-amber-700 dark:text-amber-300'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }
                  >
                    Diferencia:{' '}
                    <strong>
                      {formatAmount(Math.abs(entry.totalDebit - entry.totalCredit))}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <p>No se pudo cargar la información del asiento.</p>
            )}
          </div>

          {hasDifference ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200">
              El asiento está desbalanceado. Ajusta los montos antes de contabilizar.
            </div>
          ) : null}

          {entry && entry.lines ? (
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
          ) : null}

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || !entry || hasDifference}
          >
            {isLoading ? 'Contabilizando...' : 'Confirmar contabilización'}
          </button>
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
