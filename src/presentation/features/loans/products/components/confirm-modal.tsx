import type { ReactNode } from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  panelClassName?: string
  isProcessing?: boolean
  confirmDisabled?: boolean
  showConfirm?: boolean
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  panelClassName,
  isProcessing,
  confirmDisabled,
  showConfirm = true,
  children,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur">
      <div
        className={`flex max-h-[calc(100vh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950 ${
          panelClassName ?? 'max-w-md'
        }`}
      >
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>
          {children ? <div className="mt-4">{children}</div> : null}
        </div>
        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={onCancel}
              disabled={isProcessing}
            >
              {cancelLabel}
            </button>
            {showConfirm ? (
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm"
                onClick={onConfirm}
                disabled={isProcessing || confirmDisabled}
              >
                {isProcessing ? 'Procesando...' : confirmLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
