import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoanApplicationForm } from '@/presentation/features/loans/applications/components/loan-application-form'
import { useLoanApplicationMutations } from '@/presentation/features/loans/applications/hooks/use-loan-application-mutations'
import { useLoanApplicationOptions } from '@/presentation/features/loans/applications/hooks/use-loan-application-options'
import { MessageModal } from '@/presentation/share/components/message-modal'

interface FeedbackState {
  tone: 'success' | 'error' | 'info' | 'warning'
  title: string
  description: string
  onAcknowledge?: () => void
}

export const LoanApplicationCreatePage = () => {
  const navigate = useNavigate()
  const options = useLoanApplicationOptions()
  const { create, isSaving, error } = useLoanApplicationMutations()
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Nueva solicitud de crédito</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra una solicitud en estado borrador.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <LoanApplicationForm
          isSubmitting={isSaving}
          onSubmit={async (values) => {
            const result = await create({
              ...values,
              notes: values.notes || null,
              suggestedPaymentFrequencyId: values.suggestedPaymentFrequencyId || null,
            })
            if (result.success) {
              setFeedback({
                tone: 'success',
                title: 'Solicitud creada',
                description: 'La solicitud se creó correctamente.',
                onAcknowledge: () => navigate(`/loans/applications/${result.data.id}`),
              })
              return
            }
            setFeedback({
              tone: 'error',
              title: 'No se pudo crear la solicitud',
              description: result.error,
            })
          }}
          onCancel={() => navigate('/loans/applications')}
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
