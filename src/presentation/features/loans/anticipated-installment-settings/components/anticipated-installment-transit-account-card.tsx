import { useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { AnticipatedInstallmentTransitAccountSettingDto } from '@/infrastructure/interfaces/system/anticipated-installment-transit-account-setting.dto'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { GlAccountsSelector } from '@/presentation/features/loans/products/components/gl-accounts-selector'

interface Props {
  state: AnticipatedInstallmentTransitAccountSettingDto | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  onSearchAccounts: (query: string) => Promise<ChartAccountListItem[]>
  onResolveAccount: (id: string) => Promise<ChartAccountListItem | null>
  onSave: (id: string | null) => Promise<boolean>
}

export const AnticipatedInstallmentTransitAccountCard = ({
  state,
  isLoading,
  isSaving,
  error,
  onSearchAccounts,
  onResolveAccount,
  onSave,
}: Props) => {
  const [open, setOpen] = useState(false)
  const [accountId, setAccountId] = useState<string | null>(null)

  const openModal = () => {
    setAccountId(state?.anticipatedInstallmentTransitGlAccountId ?? null)
    setOpen(true)
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Cuenta contable transitoria</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Cuenta utilizada al contabilizar la cuota anticipada durante el desembolso.
          </p>
        </div>
        <button type="button" className="btn-primary px-4 py-2 text-sm" disabled={isLoading || isSaving} onClick={openModal}>
          Configurar cuenta
        </button>
      </div>
      {isLoading ? <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Consultando cuenta...</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {state ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Value label="Estado" value={state.isConfigured ? (state.isValid ? 'Configurada y válida' : 'Configuración inválida') : 'Sin configurar'} />
          <Value label="Código" value={state.anticipatedInstallmentTransitGlAccountCode?.trim() || '—'} />
          <Value label="Cuenta" value={state.anticipatedInstallmentTransitGlAccountName?.trim() || '—'} />
          {!state.isConfigured || !state.isValid ? (
            <p className="md:col-span-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
              {state.validationMessage?.trim() || 'La cuenta transitoria debe configurarse y ser válida antes de operar.'}
            </p>
          ) : null}
        </div>
      ) : null}

      <ConfirmModal open={open} title="Configurar cuenta transitoria" description="Selecciona una cuenta imputable activa del plan de cuentas o limpia la configuración." confirmLabel="Guardar" isProcessing={isSaving} onCancel={() => setOpen(false)} onConfirm={async () => {
        if (await onSave(accountId)) setOpen(false)
      }}>
        <GlAccountsSelector
          label="Cuenta contable"
          value={accountId}
          onChange={(value) => setAccountId(value || null)}
          onSearch={onSearchAccounts}
          onResolveAccount={onResolveAccount}
        />
      </ConfirmModal>
    </section>
  )
}

const Value = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
