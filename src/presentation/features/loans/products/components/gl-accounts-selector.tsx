import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface GlAccountsSelectorProps {
  label: string
  value?: string | null
  onChange: (accountId: string) => void
  onSearch: (query: string) => Promise<ChartAccountListItem[]>
  onResolveAccount?: (accountId: string) => Promise<ChartAccountListItem | null>
  isSearching?: boolean
  error?: string | null
  placeholder?: string
}

const getAccountLabel = (account: ChartAccountListItem) =>
  `${account.code} - ${account.name}`

const toOption = (
  account: ChartAccountListItem,
): AsyncSelectOption<ChartAccountListItem> => ({
  value: account.id,
  label: getAccountLabel(account),
  meta: account,
})

export const GlAccountsSelector = ({
  label,
  value,
  onChange,
  onSearch,
  onResolveAccount,
  isSearching,
  error,
  placeholder = 'Buscar cuenta por código o nombre...',
}: GlAccountsSelectorProps) => {
  const [selectedOption, setSelectedOption] =
    useState<AsyncSelectOption<ChartAccountListItem> | null>(null)

  useEffect(() => {
    if (!value) {
      setSelectedOption(null)
      return
    }

    if (selectedOption?.value === value) {
      return
    }

    setSelectedOption(null)

    if (onResolveAccount) {
      void onResolveAccount(value).then((resolved) => {
        if (resolved) {
          setSelectedOption(toOption(resolved))
        }
      })
    }
  }, [value, onResolveAccount, selectedOption?.value])

  const selectionLabel = useMemo(() => {
    if (!selectedOption) return 'Sin cuenta seleccionada.'
    return `Cuenta seleccionada: ${selectedOption.label}`
  }, [selectedOption])

  const loadOptions = useCallback(
    async (inputValue: string) => {
      const results = await onSearch(inputValue.trim())
      return results.map(toOption)
    },
    [onSearch],
  )

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <AsyncSelect<ChartAccountListItem>
        value={selectedOption}
        onChange={(option) => {
          setSelectedOption(option)
          onChange(option?.value ?? '')
        }}
        loadOptions={loadOptions}
        placeholder={placeholder}
        defaultOptions
        isClearable
        isLoading={isSearching}
        noOptionsMessage="No hay resultados."
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <p className="text-xs text-slate-500 dark:text-slate-400">{selectionLabel}</p>
    </div>
  )
}
