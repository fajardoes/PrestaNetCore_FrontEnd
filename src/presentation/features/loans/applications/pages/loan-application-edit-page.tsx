import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LoanApplicationForm } from '@/presentation/features/loans/applications/components/loan-application-form'
import { useLoanApplication } from '@/presentation/features/loans/applications/hooks/use-loan-application'
import { useLoanApplicationMutations } from '@/presentation/features/loans/applications/hooks/use-loan-application-mutations'
import { useLoanApplicationOptions } from '@/presentation/features/loans/applications/hooks/use-loan-application-options'
import { MessageModal } from '@/presentation/share/components/message-modal'

interface FeedbackState {
  tone: 'success' | 'error' | 'info' | 'warning'
  title: string
  description: string
  onAcknowledge?: () => void
}

interface EditNavigationState {
  returnTo?: string
}

export const LoanApplicationEditPage = () => {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const options = useLoanApplicationOptions()
  const { application, isLoading, error, loadById } = useLoanApplication()
  const { update, isSaving } = useLoanApplicationMutations()
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const navigationState = location.state as EditNavigationState | null
  const returnTo =
    typeof navigationState?.returnTo === 'string'
      ? (navigationState.returnTo || '/loans/applications')
      : '/loans/applications'

  useEffect(() => {
    if (!id) return
    void loadById(id)
  }, [id, loadById])

  if (isLoading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando solicitud...</p>
  }

  if (error || !application) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {error ?? 'No se encontró la solicitud.'}
      </div>
    )
  }

  const isDraft = application.statusCode === 'DRAFT'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Editar solicitud</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Solo se permite edición en estado borrador.
        </p>
      </div>

      {!isDraft ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          Esta solicitud no está en borrador. Se muestra en modo solo lectura.
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <LoanApplicationForm
          initialValues={{
            clientId: application.clientId,
            loanProductId: application.loanProductId,
            promoterId: application.promoterId,
            requestedPrincipal: application.requestedPrincipal,
            requestedTerm: application.requestedTerm,
            requestedPaymentFrequencyId: application.requestedPaymentFrequencyId,
            suggestedPaymentFrequencyId: application.suggestedPaymentFrequencyId || null,
            notes: application.notes || null,
          }}
          isSubmitting={isSaving}
          readOnly={!isDraft}
          onSubmit={async (values) => {
            if (!isDraft) return
            const result = await update(id, {
              ...values,
              notes: values.notes || null,
              suggestedPaymentFrequencyId: values.suggestedPaymentFrequencyId || null,
            })
            if (result.success) {
              setFeedback({
                tone: 'success',
                title: 'Solicitud actualizada',
                description: 'Los cambios se guardaron correctamente.',
                onAcknowledge: () => navigate(returnTo),
              })
              return
            }
            setFeedback({
              tone: 'error',
              title: 'No se pudo actualizar la solicitud',
              description: result.error,
            })
          }}
          onCancel={() => navigate(returnTo)}
          {...options}
        />
      </div>

      <MessageModal
        open={Boolean(feedback)}
        tone={feedback?.tone}
        title={feedback?.title || ''}
        description={feedback?.description || ''}
        onAcknowledge={() => {
          const callback = feedback?.onAcknowledge
          setFeedback(null)
          callback?.()
        }}
      />
    </div>
  )
}
