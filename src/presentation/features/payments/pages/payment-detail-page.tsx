import { Link, useParams } from 'react-router-dom'
import { PaymentDetailView } from '@/presentation/features/payments/components/payment-detail-view'
import { usePaymentDetail } from '@/presentation/features/payments/hooks/use-payment-detail'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'

export const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('payments.read')
  const { payment, isLoading, error } = usePaymentDetail(id)

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Tu usuario no tiene permiso para consultar el detalle de pagos.</p>
      </div>
    )
  }

  if (isLoading || isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando detalle del pago...
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error || 'No fue posible cargar el pago.'}
        </div>
        <Link to="/payments" className="btn-secondary inline-flex px-4 py-2 text-sm">
          Volver a pagos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/payments" className="text-sm font-medium text-primary hover:underline">
          Volver a pagos
        </Link>
      </div>
      <PaymentDetailView payment={payment} />
    </div>
  )
}
