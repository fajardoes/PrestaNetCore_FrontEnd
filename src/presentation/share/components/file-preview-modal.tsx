interface FilePreviewModalProps {
  open: boolean
  fileName?: string
  fileUrl?: string
  contentType?: string
  isLoading?: boolean
  error?: string | null
  onClose: () => void
  onDownload?: () => void
  isDownloading?: boolean
}

const isImageType = (contentType?: string) => contentType?.startsWith('image/')
const isPdfType = (contentType?: string) =>
  contentType?.includes('pdf') || contentType === 'application/pdf'

export const FilePreviewModal = ({
  open,
  fileName,
  fileUrl,
  contentType,
  isLoading,
  error,
  onClose,
  onDownload,
  isDownloading,
}: FilePreviewModalProps) => {
  if (!open) return null

  const canPreviewAsImage = isImageType(contentType)
  const canPreviewAsPdf = isPdfType(contentType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
              Vista previa de documento
            </h3>
            <p className="truncate text-xs text-slate-600 dark:text-slate-400">
              {fileName ?? 'Documento'}
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar vista previa">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex h-[70vh] items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
          {isLoading ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">Cargando vista previa...</p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          ) : !fileUrl ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">No hay documento para previsualizar.</p>
          ) : canPreviewAsImage ? (
            <img
              src={fileUrl}
              alt={fileName ?? 'Documento'}
              className="max-h-full max-w-full rounded-lg border border-slate-200 bg-white object-contain shadow-sm dark:border-slate-700 dark:bg-slate-950"
            />
          ) : canPreviewAsPdf ? (
            <iframe
              src={fileUrl}
              title={fileName ?? 'Documento PDF'}
              className="h-full w-full rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Este tipo de archivo no admite vista previa. Usa Descargar.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onClose}>
            Cerrar
          </button>
          {onDownload ? (
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              onClick={onDownload}
              disabled={isDownloading}
            >
              {isDownloading ? 'Descargando...' : 'Descargar'}
            </button>
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

