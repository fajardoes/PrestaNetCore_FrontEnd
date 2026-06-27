import { Download, Eye, FileText } from 'lucide-react'
import type { BankDepositProofDocumentResponse } from '@/infrastructure/payments/responses/payment-response'

interface BankPaymentProofDocumentPanelProps {
  document: BankDepositProofDocumentResponse | null | undefined
  isReviewed?: boolean
  isPreviewing?: boolean
  isDownloading?: boolean
  error?: string | null
  onPreview: () => void
  onDownload: () => void
}

export const BankPaymentProofDocumentPanel = ({
  document,
  isReviewed,
  isPreviewing,
  isDownloading,
  error,
  onPreview,
  onDownload,
}: BankPaymentProofDocumentPanelProps) => {
  const canUseDocument = Boolean(document?.downloadUrl)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Comprobante bancario adjunto
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Evidencia cargada para revisar el abono bancario.
          </p>
        </div>
        {canUseDocument ? (
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
              isReviewed
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-200'
                : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'
            }`}
          >
            {isReviewed ? 'Revisado' : 'Pendiente de abrir'}
          </span>
        ) : null}
      </div>

      {!document ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          Este abono no tiene comprobante adjunto. No debería aprobarse sin revisión interna.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                {document.originalFileName || 'Comprobante'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {document.contentType || 'Tipo no identificado'} · {formatFileSize(document.fileSizeBytes)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              type="button"
              className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canUseDocument || isPreviewing}
              onClick={onPreview}
            >
              <Eye className="h-4 w-4" />
              {isPreviewing ? 'Abriendo...' : 'Ver'}
            </button>
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canUseDocument || isDownloading}
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Descargando...' : 'Descargar'}
            </button>
          </div>
        </div>
      )}

      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
    </section>
  )
}

const formatFileSize = (value?: number | string | null) => {
  const bytes =
    typeof value === 'string'
      ? Number(value)
      : typeof value === 'number'
        ? value
        : Number.NaN

  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
