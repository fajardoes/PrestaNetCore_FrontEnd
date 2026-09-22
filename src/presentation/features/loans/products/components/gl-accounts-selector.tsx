import { useCallback, useEffect, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface GlAccountsSelectorProps {
  label: string
  description?: string
  required?: boolean
  value?: string | null
  onChange: (accountId: string) => void
  onSearch: (query: string) => Promise<ChartAccountListItem[]>
  onResolveAccount?: (accountId: string) => Promise<ChartAccountListItem | null>
  isSearching?: boolean
  error?: string | null
  placeholder?: string
}

const getAccountLabel = (account: ChartAccountListItem) =>
  `${account.code} · ${account.name}`

const toOption = (
  account: ChartAccountListItem,
): AsyncSelectOption<ChartAccountListItem> => ({
  value: account.id,
  label: getAccountLabel(account),
  meta: account,
})

export const GlAccountsSelector = ({
  label,
  description,
  required,
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

  const loadOptions = useCallback(
    async (inputValue: string) => {
      const results = await onSearch(inputValue.trim())
      const options = results.map(toOption)

      if (
        !inputValue.trim() &&
        selectedOption &&
        !options.some((option) => option.value === selectedOption.value)
      ) {
        options.unshift(selectedOption)
      }

      return options
    },
    [onSearch, selectedOption],
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        {required !== undefined ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              required
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {required ? 'Requerida' : 'Opcional'}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="-mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      <AsyncSelect<ChartAccountListItem>
        key={selectedOption?.value ?? 'no-selected-account'}
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
    </div>
  )
}
