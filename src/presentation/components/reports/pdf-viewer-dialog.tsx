import { useState, type ReactElement } from 'react'
import { PDFViewer, pdf } from '@react-pdf/renderer'
import { useNotifications } from '@/providers/NotificationProvider'

interface PdfViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  document: ReactElement
  title?: string
}

const buildFilename = (title?: string) => {
  if (!title) return 'reporte.pdf'
  const safe = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${safe || 'reporte'}.pdf`
}

export const PdfViewerDialog = ({
  isOpen,
  onClose,
  document: pdfDocument,
  title,
}: PdfViewerDialogProps) => {
  const { notify } = useNotifications()
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const blob = await pdf(pdfDocument).toBlob()
      const url = window.URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = buildFilename(title)
      link.click()
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    } catch {
      notify('No se pudo generar el PDF. Intenta nuevamente.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {title ?? 'Vista previa de PDF'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Usa el visor para revisar el documento antes de imprimir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar visor PDF"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 bg-slate-50 px-4 py-4 dark:bg-slate-900">
          <div className="h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              {pdfDocument}
            </PDFViewer>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={isGenerating}
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
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
