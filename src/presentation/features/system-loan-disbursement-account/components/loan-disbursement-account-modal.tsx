import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'

interface LoanDisbursementAccountModalProps {
  open: boolean
  state: LoanDisbursementAccountSettingDto | null
  isSaving?: boolean
  isSearching?: boolean
  searchError?: string | null
  onClose: () => void
  onSubmit: (accountId: string | null) => void
  onSearch: (query: string) => Promise<ChartAccountListItem[]>
}

const getAccountLabel = (account: {
  code?: string | null
  name?: string | null
}) => {
  const code = account.code?.trim() || 'Sin código'
  const name = account.name?.trim() || 'Sin nombre'
  return `${code} - ${name}`
}

const toOption = (
  account: ChartAccountListItem,
): AsyncSelectOption<ChartAccountListItem> => ({
  value: account.id,
  label: getAccountLabel(account),
  meta: account,
})

export const LoanDisbursementAccountModal = ({
  open,
  state,
  isSaving,
  isSearching,
  searchError,
  onClose,
  onSubmit,
  onSearch,
}: LoanDisbursementAccountModalProps) => {
  const menuPortalTarget = typeof document !== 'undefined' ? document.body : null
  const [selectedOption, setSelectedOption] =
    useState<AsyncSelectOption<ChartAccountListItem> | null>(null)

  useEffect(() => {
    if (!open) return

    if (
      state?.loanDisbursementGlAccountId &&
      state.loanDisbursementGlAccountCode &&
      state.loanDisbursementGlAccountName
    ) {
      setSelectedOption({
        value: state.loanDisbursementGlAccountId,
        label: getAccountLabel({
          code: state.loanDisbursementGlAccountCode,
          name: state.loanDisbursementGlAccountName,
        }),
      })
      return
    }

    setSelectedOption(null)
  }, [open, state])

  const loadOptions = useCallback(
    async (inputValue: string) => {
      const results = await onSearch(inputValue.trim())
      return results
        .filter((account) => account.isActive && !account.isGroup)
        .map(toOption)
    },
    [onSearch],
  )

  const selectionLabel = useMemo(() => {
    if (!selectedOption) return 'No se seleccionó una cuenta.'
    return `Cuenta seleccionada: ${selectedOption.label}`
  }, [selectedOption])

  return (
    <ConfirmModal
      open={open}
      title="Actualizar cuenta de desembolso"
      description="Selecciona una cuenta imputable activa del plan de cuentas. También puedes limpiar la configuración."
      confirmLabel="Guardar"
      cancelLabel="Cancelar"
      panelClassName="max-w-2xl"
      isProcessing={isSaving}
      onCancel={onClose}
      onConfirm={() => onSubmit(selectedOption?.value ?? null)}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="loan-disbursement-account"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Cuenta contable
          </label>
          <AsyncSelect<ChartAccountListItem>
            value={selectedOption}
            onChange={(option) => setSelectedOption(option)}
            loadOptions={loadOptions}
            inputId="loan-disbursement-account"
            instanceId="loan-disbursement-account"
            placeholder="Buscar por código o nombre..."
            defaultOptions
            isClearable
            isDisabled={isSaving}
            isLoading={isSearching}
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
            noOptionsMessage="No hay cuentas imputables activas."
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {selectionLabel}
          </p>
          {searchError ? (
            <p className="text-xs text-red-500 dark:text-red-300">
              {searchError}
            </p>
          ) : null}
        </div>
      </div>
    </ConfirmModal>
  )
}
