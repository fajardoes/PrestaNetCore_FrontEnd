import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getPaymentReversalAction } from '@/core/actions/payments/get-payment-reversal.action'
import type { PaymentReversalResponse } from '@/infrastructure/payments/responses/payment-reversal-response'
import { EffectivizePaymentModal } from '@/presentation/features/payments/components/effectivize-payment-modal'
import { PaymentDetailView } from '@/presentation/features/payments/components/payment-detail-view'
import { ReversePaymentModal } from '@/presentation/features/payments/components/reverse-payment-modal'
import { usePaymentActions } from '@/presentation/features/payments/hooks/use-payment-actions'
import { usePaymentDetail } from '@/presentation/features/payments/hooks/use-payment-detail'
import { usePaymentMutations } from '@/presentation/features/payments/hooks/use-payment-mutations'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useNotifications } from '@/providers/NotificationProvider'

export const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('payments.read')
  const { payment, isLoading, error, refresh } = usePaymentDetail(id)
  const paymentActions = usePaymentActions(id, canRead)
  const businessDate = useBusinessDate()
  const mutations = usePaymentMutations()
  const [reversal, setReversal] = useState<PaymentReversalResponse | null>(null)
  const [reversalError, setReversalError] = useState<string | null>(null)
  const [effectivizeOpen, setEffectivizeOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)

  const loadReversal = useCallback(async () => {
    if (!id || payment?.statusCode !== 'REVERSED') {
      setReversal(null)
      setReversalError(null)
      return
    }

    const result = await getPaymentReversalAction(id)
    if (!result.success) {
      setReversal(null)
      setReversalError(result.error)
      return
    }

    setReversal(result.data)
    setReversalError(null)
  }, [id, payment?.statusCode])

  useEffect(() => {
    void loadReversal()
  }, [loadReversal])

  const refreshAll = async () => {
    await Promise.all([refresh(), paymentActions.refresh(), businessDate.refresh()])
    await loadReversal()
  }

  const actionDisabledReason = (code: 'effectivize' | 'reverse') => {
    const action = paymentActions.actions?.allowedActions.find((item) => item.code === code)
    if (action?.enabled) return null
    return action?.reason || 'Acción no disponible.'
  }

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
      <PaymentDetailView
        payment={payment}
        actions={paymentActions.actions}
        actionsError={paymentActions.error}
        reversal={reversal}
        reversalError={reversalError}
        onEffectivize={() => {
          mutations.setError(null)
          setEffectivizeOpen(true)
        }}
        onReverse={() => {
          mutations.setError(null)
          setReverseOpen(true)
        }}
      />

      <EffectivizePaymentModal
        open={effectivizeOpen}
        payment={payment}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={actionDisabledReason('effectivize')}
        onClose={() => {
          mutations.setError(null)
          setEffectivizeOpen(false)
        }}
        onSubmit={async (payload) => {
          const disabledReason = actionDisabledReason('effectivize')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.effectivize(payment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await refreshAll()
            return false
          }
          notify('Pago efectivizado correctamente.', 'success')
          await refreshAll()
          return true
        }}
      />

      <ReversePaymentModal
        open={reverseOpen}
        payment={payment}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={actionDisabledReason('reverse')}
        onClose={() => {
          mutations.setError(null)
          setReverseOpen(false)
        }}
        onSubmit={async (payload) => {
          const disabledReason = actionDisabledReason('reverse')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.reverse(payment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await refreshAll()
            return false
          }
          notify('Pago reversado correctamente.', 'success')
          await refreshAll()
          return true
        }}
      />
    </div>
  )
}
