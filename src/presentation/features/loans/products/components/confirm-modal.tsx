interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  isProcessing?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isProcessing,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-secondary px-4 py-2 text-sm"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
