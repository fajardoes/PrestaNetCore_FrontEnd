import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { LoanInstallmentDetailResponse } from '@/infrastructure/loans/responses/loan-installment-detail-response'
import {
  formatDate,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { InstallmentDetailContent } from '@/presentation/features/loans/loans-query/components/installment-detail-content'

interface InstallmentDetailModalProps {
  open: boolean
  installmentNo: number | null
  loanLabel: string
  installment: LoanInstallmentDetailResponse | null
  isLoading: boolean
  error: string | null
  onClose: () => void
}

export const InstallmentDetailModal = ({
  open,
  installmentNo,
  loanLabel,
  installment,
  isLoading,
  error,
  onClose,
}: InstallmentDetailModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/10 dark:border-slate-700 dark:bg-slate-950 sm:max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="installment-detail-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="installment-detail-modal-title"
                  className="text-base font-semibold text-slate-950 dark:text-slate-50"
                >
                  Cuota #{installmentNo ?? '—'}
                </h2>
                {installment ? (
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(installment.statusCode)}`}
                  >
                    {translateLoanApplicationStatus(installment.statusCode, installment.statusName)}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 flex flex-col gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:flex-wrap">
                <span>Vencimiento: {formatDate(installment?.dueDateAdjusted)}</span>
                <span className="truncate">Préstamo: {loanLabel}</span>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="btn-icon shrink-0"
              onClick={onClose}
              aria-label="Cerrar detalle de cuota"
              title="Cerrar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          <InstallmentDetailContent
            installment={installment}
            isLoading={isLoading}
            error={error}
          />
        </div>

        <footer className="flex shrink-0 justify-end border-t border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900/60 sm:px-5">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onClose}>
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  )
}
