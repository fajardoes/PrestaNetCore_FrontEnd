import { useEffect, useMemo, useState } from 'react'
import { MessageModal } from '@/presentation/share/components/message-modal'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import { LoanApplicationFinancialProfileForm, mapFinancialProfileToFormValues } from '@/presentation/features/loans/applications/components/loan-application-financial-profile-form'
import {
  financialProfileBadgeClass,
  financialProfileCompletenessBadgeClass,
  formatDateTime,
  formatRatio,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { useLoanApplicationFinancialProfile } from '@/presentation/features/loans/applications/hooks/use-loan-application-financial-profile'

interface LoanApplicationFinancialProfileSectionProps {
  application: LoanApplicationResponse
  canUpdateDraftAction: boolean
  onSaved?: (profile: LoanApplicationFinancialProfileResponse) => void
}

interface FeedbackState {
  tone: 'success' | 'error' | 'info' | 'warning'
  title: string
  description: string
}

export const LoanApplicationFinancialProfileSection = ({
  application,
  canUpdateDraftAction,
  onSaved,
}: LoanApplicationFinancialProfileSectionProps) => {
  const { hasPermission } = useUserPermissions()
  const canSaveFinancialProfile =
    hasPermission('loan_applications.update_draft') && canUpdateDraftAction
  const isDraft = (application.statusCode ?? '').trim().toUpperCase() === 'DRAFT'
  const {
    profile,
    isLoading,
    isSaving,
    isMissing,
    isForbidden,
    error,
    saveError,
    load,
    save,
    clearSaveError,
  } = useLoanApplicationFinancialProfile()
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  useEffect(() => {
    if (!application.id) return
    void load(application.id)
  }, [application.id, load])

  const hasExistingProfile = profile != null || Boolean(application.hasFinancialProfile && !isMissing)
  const isComplete = profile?.isComplete ?? application.isFinancialProfileComplete ?? false
  const lastUpdatedAt = profile?.updatedAt ?? application.financialProfileUpdatedAt ?? null
  const debtRatio = profile?.debtRatio ?? application.financialDebtRatio ?? null
  const debtToEquityRatio =
    profile?.debtToEquityRatio ?? application.financialDebtToEquityRatio ?? null
  const readOnly = !isDraft || !canSaveFinancialProfile
  const initialValues = useMemo(
    () => mapFinancialProfileToFormValues(profile),
    [profile],
  )

  return (
    <>
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ficha financiera
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Consolidado patrimonial y financiero de la solicitud.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(application.statusCode)}`}
            >
              {translateLoanApplicationStatus(application.statusCode, application.statusName)}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${financialProfileBadgeClass(hasExistingProfile)}`}
            >
              {hasExistingProfile ? 'Ficha registrada' : 'Sin ficha'}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${financialProfileCompletenessBadgeClass(isComplete)}`}
            >
              {isComplete ? 'Completa' : 'Incompleta'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <MetaInfo label="Ultima actualizacion" value={formatDateTime(lastUpdatedAt)} />
          <MetaInfo label="Ratio pasivos / activos" value={formatRatio(debtRatio)} />
          <MetaInfo label="Ratio pasivos / patrimonio" value={formatRatio(debtToEquityRatio)} />
        </div>

        {!isDraft ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            La ficha financiera solo puede editarse mientras la solicitud está en borrador.
          </div>
        ) : null}

        {isMissing ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200">
            Aún no existe una ficha financiera registrada para esta solicitud.
          </div>
        ) : null}

        {isForbidden ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            No tienes permisos para consultar la ficha financiera.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {saveError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {saveError}
          </div>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cargando ficha financiera...
          </p>
        ) : !isForbidden ? (
          <LoanApplicationFinancialProfileForm
            initialValues={initialValues}
            snapshot={profile}
            readOnly={readOnly}
            isSubmitting={isSaving}
            onSubmit={async (payload) => {
              clearSaveError()
              const result = await save(application.id, payload)
              if (!result.success) {
                if (result.status === 409) {
                  setFeedback({
                    tone: 'warning',
                    title: 'Solicitud fuera de borrador',
                    description:
                      'La solicitud ya no está en borrador. Recarga el expediente para continuar.',
                  })
                }
                return
              }

              setFeedback({
                tone: 'success',
                title: 'Ficha financiera guardada',
                description: 'Los datos base se guardaron y los totales fueron recalculados.',
              })
              onSaved?.(result.data)
            }}
          />
        ) : null}
      </section>

      <MessageModal
        open={Boolean(feedback)}
        tone={feedback?.tone}
        title={feedback?.title || ''}
        description={feedback?.description || ''}
        onAcknowledge={() => setFeedback(null)}
      />
    </>
  )
}

const MetaInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
