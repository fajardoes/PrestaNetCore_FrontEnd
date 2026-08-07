import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { LoanApplicationFinancialProfileSection } from '@/presentation/features/loans/applications/components/loan-application-financial-profile-section'
import {
  applyFinancialProfileSnapshot,
  financialProfileBadgeClass,
  financialProfileCompletenessBadgeClass,
  formatMoney,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { useLoanApplication } from '@/presentation/features/loans/applications/hooks/use-loan-application'

interface FinancialProfileNavigationState {
  returnTo?: string
}

export const LoanApplicationFinancialProfilePage = () => {
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { application, allowedActions, isLoading, error, loadById, setApplication } =
    useLoanApplication()
  const navigationState = location.state as FinancialProfileNavigationState | null
  const returnTo =
    typeof navigationState?.returnTo === 'string' && navigationState.returnTo.trim()
      ? navigationState.returnTo
      : `/loans/applications/${id}`

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

  const canUpdateDraft = allowedActions.includes('update_draft')

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Ficha financiera
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Solicitud {application.applicationNo || application.id.slice(0, 8)}
            </p>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusBadgeClass(application.statusCode)}`}
            >
              {translateLoanApplicationStatus(application.statusCode, application.statusName)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {canUpdateDraft ? (
              <button
                type="button"
                className="btn-secondary whitespace-nowrap px-2.5 py-1 text-[11px]"
                onClick={() =>
                  navigate(`/loans/applications/${application.id}/edit`, {
                    state: { returnTo: `/loans/applications/${application.id}/financial-profile` },
                  })
                }
              >
                Editar solicitud
              </button>
            ) : null}
            <button
              type="button"
              className="btn-secondary whitespace-nowrap px-2.5 py-1 text-[11px]"
              onClick={() => navigate(returnTo)}
            >
              Volver a solicitud
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-6">
          <CompactInfo label="Cliente" value={application.clientFullName} />
          <CompactInfo label="Producto" value={application.loanProductName} />
          <CompactInfo label="Promotor" value={application.promoterClientFullName} />
          <CompactInfo label="Capital" value={formatMoney(application.requestedPrincipal)} />
          <CompactInfo
            label="Duración solicitada"
            value={`${application.requestedTerm} ${application.requestedTermUnitName}`}
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Estado ficha
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${financialProfileBadgeClass(application.hasFinancialProfile)}`}
              >
                {application.hasFinancialProfile ? 'Registrada' : 'Sin ficha'}
              </span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${financialProfileCompletenessBadgeClass(application.isFinancialProfileComplete)}`}
              >
                {application.isFinancialProfileComplete ? 'Completa' : 'Incompleta'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <LoanApplicationFinancialProfileSection
        application={application}
        canUpdateDraftAction={canUpdateDraft}
        onSaved={(profile) => {
          setApplication(applyFinancialProfileSnapshot(application, profile))
        }}
      />
    </div>
  )
}

const CompactInfo = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{value || '—'}</p>
  </div>
)
