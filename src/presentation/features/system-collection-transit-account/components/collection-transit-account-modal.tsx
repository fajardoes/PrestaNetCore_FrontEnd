import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { CollectionTransitAccountSettingDto } from '@/infrastructure/interfaces/system/collection-transit-account-setting.dto'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface CollectionTransitAccountModalProps {
  open: boolean
  state: CollectionTransitAccountSettingDto | null
  isSaving?: boolean
  onClose: () => void
  onSubmit: (accountId: string | null) => void
}

const getAccountLabel = (account: { code?: string | null; name?: string | null }) => {
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

export const CollectionTransitAccountModal = ({
  open,
  state,
  isSaving,
  onClose,
  onSubmit,
}: CollectionTransitAccountModalProps) => {
  const [selectedOption, setSelectedOption] =
    useState<AsyncSelectOption<ChartAccountListItem> | null>(null)
  const { searchAccounts, isLoading, error } = useGlAccountsSearch()

  useEffect(() => {
    if (!open) return
    if (
      state?.collectionTransitGlAccountId &&
      state.collectionTransitGlAccountCode &&
      state.collectionTransitGlAccountName
    ) {
      setSelectedOption({
        value: state.collectionTransitGlAccountId,
        label: getAccountLabel({
          code: state.collectionTransitGlAccountCode,
          name: state.collectionTransitGlAccountName,
        }),
      })
      return
    }
    setSelectedOption(null)
  }, [open, state])

  const loadOptions = useCallback(
    async (inputValue: string) => {
      const results = await searchAccounts(inputValue.trim())
      return results
        .filter((account) => account.isActive && !account.isGroup)
        .map(toOption)
    },
    [searchAccounts],
  )

  const selectionLabel = useMemo(() => {
    if (!selectedOption) return 'No se seleccionó una cuenta.'
    return `Cuenta seleccionada: ${selectedOption.label}`
  }, [selectedOption])

  return (
    <ConfirmModal
      open={open}
      title="Actualizar cuenta transitoria"
      description="Selecciona una cuenta imputable activa para registrar pagos operativos. También puedes limpiar la configuración."
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
            htmlFor="collection-transit-account"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Cuenta contable
          </label>
          <AsyncSelect<ChartAccountListItem>
            value={selectedOption}
            onChange={(option) => setSelectedOption(option)}
            loadOptions={loadOptions}
            inputId="collection-transit-account"
            instanceId="collection-transit-account"
            placeholder="Buscar por código o nombre..."
            defaultOptions
            isClearable
            isDisabled={isSaving}
            isLoading={isLoading}
            noOptionsMessage="No hay cuentas imputables activas."
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">{selectionLabel}</p>
          {error ? (
            <p className="text-xs text-red-500 dark:text-red-300">{error}</p>
          ) : null}
        </div>
      </div>
    </ConfirmModal>
  )
}
