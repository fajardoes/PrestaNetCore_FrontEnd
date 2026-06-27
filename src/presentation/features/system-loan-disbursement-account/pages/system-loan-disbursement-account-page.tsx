import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import { LoanDisbursementAccountModal } from '@/presentation/features/system-loan-disbursement-account/components/loan-disbursement-account-modal'
import { LoanDisbursementAccountSummaryCard } from '@/presentation/features/system-loan-disbursement-account/components/loan-disbursement-account-summary-card'
import { useLoanDisbursementAccount } from '@/presentation/features/system-loan-disbursement-account/hooks/use-loan-disbursement-account'

export const SystemLoanDisbursementAccountPage = () => {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const isAdmin = useMemo(
    () => user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false,
    [user?.roles],
  )
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    state,
    isLoading,
    isSaving,
    error,
    updateSetting,
  } = useLoanDisbursementAccount()
  const {
    searchAccounts,
    isLoading: isSearchingAccounts,
    error: searchError,
  } = useGlAccountsSearch()

  const handleSubmit = async (accountId: string | null) => {
    const success = await updateSetting(accountId)
    if (success) {
      notify('Cuenta contable de desembolso actualizada correctamente.', 'success')
      setIsModalOpen(false)
      return
    }

    notify('No fue posible actualizar la cuenta contable de desembolso.', 'error')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Sistema - Cuenta de desembolso
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra la cuenta contable usada por defecto para el desembolso de
          préstamos.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <LoanDisbursementAccountSummaryCard state={state} isLoading={isLoading} />

      {isAdmin ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Acciones administrativas
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Selecciona una cuenta imputable activa o limpia la referencia actual.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading || isSaving}
            >
              Configurar cuenta
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleSubmit(null)}
              disabled={isLoading || isSaving || !state?.isConfigured}
            >
              Limpiar configuración
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
          <p className="font-semibold">Acceso restringido</p>
          <p className="text-sm">
            Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
            pueden cambiar esta configuración.
          </p>
        </div>
      )}

      <LoanDisbursementAccountModal
        open={isModalOpen}
        state={state}
        isSaving={isSaving}
        isSearching={isSearchingAccounts}
        searchError={searchError}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(accountId) => void handleSubmit(accountId)}
        onSearch={searchAccounts}
      />
    </div>
  )
}
