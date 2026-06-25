import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getPaymentReversalAction } from '@/core/actions/payments/get-payment-reversal.action'
import type { PaymentReversalResponse } from '@/infrastructure/payments/responses/payment-reversal-response'
import { EffectivizePaymentModal } from '@/presentation/features/payments/components/effectivize-payment-modal'
import { PaymentDetailView } from '@/presentation/features/payments/components/payment-detail-view'
import { RejectBankPaymentProofModal } from '@/presentation/features/payments/components/reject-bank-payment-proof-modal'
import { ReversePaymentModal } from '@/presentation/features/payments/components/reverse-payment-modal'
import { SettleCashPaymentModal } from '@/presentation/features/payments/components/settle-cash-payment-modal'
import { usePaymentActions } from '@/presentation/features/payments/hooks/use-payment-actions'
import { useBankPaymentProofDocument } from '@/presentation/features/payments/hooks/use-bank-payment-proof-document'
import { usePaymentDetail } from '@/presentation/features/payments/hooks/use-payment-detail'
import { usePaymentMutations } from '@/presentation/features/payments/hooks/use-payment-mutations'
import { usePaymentReceiptReport } from '@/presentation/features/payments/hooks/use-payment-receipt-report'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { FilePreviewModal } from '@/presentation/share/components/file-preview-modal'
import { useNotifications } from '@/providers/NotificationProvider'

export const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const isBankRoute = location.pathname.startsWith('/bank-payment-proofs')
  const isCommonRoute = location.pathname.startsWith('/payments/')
  const canReadBank =
    hasPermission('bank_payment_proofs.read') ||
    hasPermission('bank_payment_proofs.manage_all') ||
    hasPermission('bank_payment_proofs.read_all')
  const canReadCash =
    hasPermission('cash_collections.payments.read') ||
    hasPermission('cash_collections.payments.read_all')
  const canReadGeneric = hasPermission('payments.read') || hasPermission('payments.read_all')
  const canRead = isBankRoute
    ? canReadBank
    : isCommonRoute
      ? canReadGeneric || canReadCash || canReadBank
      : canReadCash
  const { payment, isLoading, error, refresh } = usePaymentDetail(
    id,
    isBankRoute ? 'bank-proof' : 'common',
    canRead,
  )
  const paymentActions = usePaymentActions(id, canRead)
  const businessDate = useBusinessDate()
  const mutations = usePaymentMutations()
  const bankProofDocument = useBankPaymentProofDocument()
  const receiptReport = usePaymentReceiptReport()
  const [reversal, setReversal] = useState<PaymentReversalResponse | null>(null)
  const [reversalError, setReversalError] = useState<string | null>(null)
  const [bankProofReviewed, setBankProofReviewed] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<{
    fileName: string
    contentType: string
    objectUrl: string
    downloadUrl: string
  } | null>(null)
  const [effectivizeOpen, setEffectivizeOpen] = useState(false)
  const [settleOpen, setSettleOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)
  const backPath = isBankRoute
    ? '/bank-payment-proofs'
    : payment?.paymentFlowCode?.trim().toUpperCase() === 'BANK_PROOF'
      ? '/bank-payment-proofs'
      : '/cash-collections/payments'

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

  useEffect(() => {
    setBankProofReviewed(false)
    setPreviewDocument((previous) => {
      if (previous?.objectUrl) window.URL.revokeObjectURL(previous.objectUrl)
      return null
    })
  }, [payment?.id])

  useEffect(() => {
    return () => {
      if (previewDocument?.objectUrl) {
        window.URL.revokeObjectURL(previewDocument.objectUrl)
      }
    }
  }, [previewDocument])

  const refreshAll = async () => {
    await Promise.all([refresh(), paymentActions.refresh(), businessDate.refresh()])
    await loadReversal()
  }

  const actionDisabledReason = (code: 'effectivize' | 'settle' | 'reject' | 'reverse') => {
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
        <Link to={backPath} className="btn-secondary inline-flex px-4 py-2 text-sm">
          Volver a pagos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to={backPath} className="text-sm font-medium text-primary hover:underline">
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
        onSettle={() => {
          mutations.setError(null)
          setSettleOpen(true)
        }}
        onReject={() => {
          mutations.setError(null)
          setRejectOpen(true)
        }}
        onReverse={() => {
          mutations.setError(null)
          setReverseOpen(true)
        }}
        onPrintReceipt={async () => {
          const result = await receiptReport.openReceipt(payment.id)
          if (!result.success) notify(result.error, 'error')
        }}
        bankProofReviewed={bankProofReviewed}
        isPreviewingBankProof={bankProofDocument.isPreviewing}
        isDownloadingBankProof={bankProofDocument.isDownloading}
        bankProofDocumentError={bankProofDocument.error}
        onPreviewBankProof={async () => {
          const document = payment.bankDepositProofDocument
          if (!document?.downloadUrl) {
            notify('El abono no tiene comprobante adjunto.', 'error')
            return
          }

          const result = await bankProofDocument.preview(
            document.downloadUrl,
            document.originalFileName || 'comprobante',
          )
          if (!result.success) {
            notify(result.error, 'error')
            return
          }

          setPreviewDocument((previous) => {
            if (previous?.objectUrl) window.URL.revokeObjectURL(previous.objectUrl)
            return {
              fileName: result.data.fileName,
              contentType: result.data.contentType || document.contentType,
              objectUrl: result.data.objectUrl,
              downloadUrl: document.downloadUrl,
            }
          })
          setBankProofReviewed(true)
        }}
        onDownloadBankProof={async () => {
          const document = payment.bankDepositProofDocument
          if (!document?.downloadUrl) {
            notify('El abono no tiene comprobante adjunto.', 'error')
            return
          }

          const result = await bankProofDocument.download(
            document.downloadUrl,
            document.originalFileName || 'comprobante',
          )
          if (!result.success) {
            notify(result.error, 'error')
            return
          }
          setBankProofReviewed(true)
        }}
      />

      <SettleCashPaymentModal
        open={settleOpen}
        payment={payment}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={actionDisabledReason('settle')}
        onClose={() => {
          mutations.setError(null)
          setSettleOpen(false)
        }}
        onConfirm={async () => {
          const disabledReason = actionDisabledReason('settle')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.settleCash(payment.id)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await refreshAll()
            return false
          }
          notify('Pago en efectivo liquidado correctamente.', 'success')
          await refreshAll()
          return true
        }}
      />

      <EffectivizePaymentModal
        open={effectivizeOpen}
        payment={payment}
        businessDate={businessDate.state?.businessDate}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={actionDisabledReason('effectivize')}
        bankProofReviewed={bankProofReviewed}
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
          const isBankProof = payment.paymentFlowCode?.trim().toUpperCase() === 'BANK_PROOF'
          const result = isBankProof
            ? await mutations.approveBankProof(payment.id, {
                bankEntityId: payload.bankEntityId || '',
                effectivizationDate: payload.effectivizationDate,
                verifiedBankDepositDate: payload.bankDepositDate,
                verifiedBankReferenceNumber: payload.bankReferenceNumber,
                reviewNotes: payload.notes,
              })
            : await mutations.effectivize(payment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await refreshAll()
            return false
          }
          notify(isBankProof ? 'Abono bancario aprobado correctamente.' : 'Pago efectivizado correctamente.', 'success')
          await refreshAll()
          return true
        }}
      />

      <FilePreviewModal
        open={Boolean(previewDocument)}
        fileName={previewDocument?.fileName}
        fileUrl={previewDocument?.objectUrl}
        contentType={previewDocument?.contentType}
        isLoading={bankProofDocument.isPreviewing}
        error={null}
        isDownloading={bankProofDocument.isDownloading}
        onClose={() => {
          setPreviewDocument((previous) => {
            if (previous?.objectUrl) window.URL.revokeObjectURL(previous.objectUrl)
            return null
          })
        }}
        onDownload={
          previewDocument
            ? async () => {
                const result = await bankProofDocument.download(
                  previewDocument.downloadUrl,
                  previewDocument.fileName,
                )
                if (!result.success) {
                  notify(result.error, 'error')
                  return
                }
                setBankProofReviewed(true)
              }
            : undefined
        }
      />

      <RejectBankPaymentProofModal
        open={rejectOpen}
        payment={payment}
        isSubmitting={mutations.isSubmitting}
        backendError={mutations.error}
        disabledReason={actionDisabledReason('reject')}
        onClose={() => {
          mutations.setError(null)
          setRejectOpen(false)
        }}
        onSubmit={async (payload) => {
          const disabledReason = actionDisabledReason('reject')
          if (disabledReason) {
            notify(disabledReason, 'warning')
            return false
          }
          const result = await mutations.rejectBankProof(payment.id, payload)
          if (!result.success) {
            notify(result.error, 'error')
            if (result.status === 409) await refreshAll()
            return false
          }
          notify('Abono bancario rechazado correctamente.', 'success')
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
          const flow = payment.paymentFlowCode?.trim().toUpperCase()
          const result =
            flow === 'BANK_PROOF'
              ? await mutations.reverseBankProof(payment.id, payload)
              : flow === 'CASH_COLLECTION'
                ? await mutations.reverseCash(payment.id, payload)
                : await mutations.reverse(payment.id, payload)
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
