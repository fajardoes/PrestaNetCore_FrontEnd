import type { PaymentResponse } from '@/infrastructure/payments/responses/payment-response'
import { PaymentDetailView } from './payment-detail-view'

interface PaymentReceiptModalProps {
  open: boolean
  payment: PaymentResponse | null
  onClose: () => void
}

export const PaymentReceiptModal = ({
  open,
  payment,
  onClose,
}: PaymentReceiptModalProps) => {
  if (!open || !payment) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end">
          <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={onClose}>
            Cerrar comprobante
          </button>
        </div>
        <PaymentDetailView
          payment={payment}
          title="Comprobante interno del pago"
          description="Registro generado por backend al confirmar el pago operativo."
        />
      </div>
    </div>
  )
}
