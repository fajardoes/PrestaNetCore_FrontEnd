import { useEffect, useState, type FormEvent } from 'react'
import { useNotifications } from '@/providers/NotificationProvider'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useLoanInterestAccrualSetting } from '@/presentation/features/system-loan-interest-accrual/hooks/use-loan-interest-accrual-setting'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { LoanInterestAccrualMode } from '@/infrastructure/interfaces/system/loan-interest-accrual-setting.dto'

const accountToOption = (account: ChartAccountListItem): AsyncSelectOption<ChartAccountListItem> => ({
  value: account.id,
  label: `${account.code} - ${account.name}`,
  meta: account,
})

const referenceToOption = (
  id: string | null | undefined,
  code: string | null | undefined,
  name: string | null | undefined,
): AsyncSelectOption<ChartAccountListItem> | null =>
  id && code && name ? { value: id, label: `${code} - ${name}` } : null

const fieldClassName =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 dark:focus:border-primary dark:focus:ring-primary/40'

export const SystemLoanInterestAccrualPage = () => {
  const { notify } = useNotifications()
  const {
    hasPermission,
    isLoading: isLoadingPermissions,
    error: permissionsError,
  } = useUserPermissions()
  const canRead = hasPermission('system.settings.loan_interest_accrual.read')
  const canManage = hasPermission('system.settings.loan_interest_accrual.manage')
  const { state, isLoading, isSaving, error, updateSetting } = useLoanInterestAccrualSetting(canRead)
  const {
    searchAccounts,
    getAccountById,
    isLoading: isSearchingAccounts,
    error: searchError,
  } = useGlAccountsSearch()
  const [mode, setMode] = useState<LoanInterestAccrualMode>('STANDARD')
  const [days, setDays] = useState(30)
  const [suspenseAccount, setSuspenseAccount] = useState<AsyncSelectOption<ChartAccountListItem> | null>(null)
  const [offsetAccount, setOffsetAccount] = useState<AsyncSelectOption<ChartAccountListItem> | null>(null)
  const isRegulatedMode = mode === 'REGULADA'

  useEffect(() => {
    if (!state) return
    setMode(state.interestAccrualMode)
    setDays(state.interestSuspensionDays)

    let cancelled = false
    const loadAccounts = async () => {
      const [suspense, offset] = await Promise.all([
        state.loanInterestSuspenseGlAccountId
          ? getAccountById(state.loanInterestSuspenseGlAccountId)
          : Promise.resolve(null),
        state.loanInterestSuspenseOffsetGlAccountId
          ? getAccountById(state.loanInterestSuspenseOffsetGlAccountId)
          : Promise.resolve(null),
      ])
      if (cancelled) return
      setSuspenseAccount(suspense ? accountToOption(suspense) : referenceToOption(
        state.loanInterestSuspenseGlAccountId,
        state.loanInterestSuspenseGlAccountCode,
        state.loanInterestSuspenseGlAccountName,
      ))
      setOffsetAccount(offset ? accountToOption(offset) : referenceToOption(
        state.loanInterestSuspenseOffsetGlAccountId,
        state.loanInterestSuspenseOffsetGlAccountCode,
        state.loanInterestSuspenseOffsetGlAccountName,
      ))
    }
    void loadAccounts()
    return () => {
      cancelled = true
    }
  }, [getAccountById, state])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManage) return
    if (mode === 'REGULADA' && (!suspenseAccount?.value || !offsetAccount?.value)) {
      notify('El modo regulado requiere las dos cuentas contables de intereses en suspenso.', 'error')
      return
    }
    const success = await updateSetting({
      interestAccrualMode: mode,
      interestSuspensionDays: mode === 'REGULADA' ? 30 : days,
      loanInterestSuspenseGlAccountId: suspenseAccount?.value ?? null,
      loanInterestSuspenseOffsetGlAccountId: offsetAccount?.value ?? null,
    })
    notify(
      success
        ? 'Configuración del devengo de intereses actualizada correctamente.'
        : 'No fue posible actualizar la configuración del devengo de intereses.',
      success ? 'success' : 'error',
    )
  }

  if (isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando permisos...
      </div>
    )
  }

  if (!canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para consultar la configuración del devengo de intereses.
        </p>
        {permissionsError ? <p className="mt-2 text-xs">{permissionsError}</p> : null}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Sistema - Devengo de intereses
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Define si el cierre diario reconoce intereses normalmente o aplica suspensión de intereses conforme al criterio regulatorio para operaciones atrasadas.
        </p>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">{error}</div> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Política de reconocimiento</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {isRegulatedMode
                ? 'En el modo regulado la cuota se suspende al completar 30 días de mora. El día de vencimiento se cuenta como día 1.'
                : 'En el modo estándar el cierre reconoce normalmente el interés pendiente del calendario, aunque el préstamo tenga mora.'}
            </p>
          </div>
          <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${state?.isValid ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-200' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100'}`}>
            {isLoading ? 'Cargando...' : state?.isValid ? 'Configuración válida' : 'Pendiente de revisar'}
          </span>
        </div>

        <form className="mt-5 space-y-5" onSubmit={(event) => void handleSubmit(event)}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Modo de devengo
              <select value={mode} onChange={(event) => setMode(event.target.value as LoanInterestAccrualMode)} disabled={!canManage || isLoading || isSaving} className={fieldClassName}>
                <option value="STANDARD">Estándar: devengo normal</option>
                <option value="REGULADA">Regulada: suspensión por mora</option>
              </select>
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Días para suspender <span className="font-normal text-slate-500 dark:text-slate-400">(solo modo regulado)</span>
              <input type="number" min={1} max={365} value={isRegulatedMode ? 30 : ''} onChange={(event) => setDays(Number(event.target.value))} disabled={!canManage || !isRegulatedMode || isLoading || isSaving} className={fieldClassName} />
              <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                {isRegulatedMode
                  ? 'La normativa configurada utiliza 30 días de mora; el día de vencimiento cuenta como día 1.'
                  : 'No aplica en modo estándar. Este valor no detiene ni suspende el devengo por mora.'}
              </span>
            </label>
          </div>

          <div className={`rounded-xl border p-4 text-sm ${isRegulatedMode ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100' : 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100'}`}>
            <p className="font-semibold">{isRegulatedMode ? 'Comportamiento regulado' : 'Comportamiento estándar'}</p>
            <p className="mt-1">
              {isRegulatedMode
                ? 'Al alcanzar 30 días de mora, el interés previamente reconocido y no cobrado se reclasifica, y el nuevo interés se registra en cuentas de orden hasta que exista un cobro.'
                : 'Cada cierre registra el interés pendiente del calendario como interés por cobrar e ingreso ganado. La mora no activa suspensión ni reclasificación de ingresos.'}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Cuenta deudora de orden: intereses en suspenso
              <AsyncSelect<ChartAccountListItem>
                value={suspenseAccount}
                onChange={(option) => setSuspenseAccount(option as AsyncSelectOption<ChartAccountListItem> | null)}
                loadOptions={async (query) => (await searchAccounts(query)).map(accountToOption)}
                defaultOptions
                isClearable
                isDisabled={!canManage || isLoading || isSaving}
                isLoading={isSearchingAccounts}
                placeholder="Buscar cuenta imputable activa"
                inputId="loan-interest-suspense-account"
                instanceId="loan-interest-suspense-account"
                menuPortalTarget={typeof document === 'undefined' ? null : document.body}
                menuPosition="fixed"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Cuenta acreedora de orden: contrapartida
              <AsyncSelect<ChartAccountListItem>
                value={offsetAccount}
                onChange={(option) => setOffsetAccount(option as AsyncSelectOption<ChartAccountListItem> | null)}
                loadOptions={async (query) => (await searchAccounts(query)).map(accountToOption)}
                defaultOptions
                isClearable
                isDisabled={!canManage || isLoading || isSaving}
                isLoading={isSearchingAccounts}
                placeholder="Buscar cuenta imputable activa"
                inputId="loan-interest-suspense-offset-account"
                instanceId="loan-interest-suspense-offset-account"
                menuPortalTarget={typeof document === 'undefined' ? null : document.body}
                menuPosition="fixed"
              />
            </label>
          </div>

          {searchError ? <p className="text-sm text-red-600 dark:text-red-300">{searchError}</p> : null}
          {state?.validationMessage ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100">{state.validationMessage}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary btn-list-action disabled:cursor-not-allowed disabled:opacity-60" disabled={!canManage || isLoading || isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar configuración'}
            </button>
            {!canManage ? <span className="text-sm text-amber-700 dark:text-amber-200">Tu usuario puede consultar la configuración, pero no tiene permiso para modificarla.</span> : null}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100">
        <p className="font-semibold">Comportamiento contable</p>
        <p className="mt-1">
          {isRegulatedMode
            ? 'Al suspender, el ingreso y el interés por cobrar previamente reconocido se revierten. El interés nuevo se registra en cuentas de orden y solo pasa a ingresos cuando existe un cobro.'
            : 'En modo estándar no se generan asientos de suspensión ni reversiones por mora. El interés pendiente se registra en intereses por cobrar contra intereses ganados.'}
        </p>
      </section>
    </div>
  )
}
