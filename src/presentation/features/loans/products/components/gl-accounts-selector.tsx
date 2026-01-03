import { useEffect, useMemo, useState } from 'react'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'

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
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<ChartAccountListItem[]>([])
  const [lastQuery, setLastQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<ChartAccountListItem | null>(
    null,
  )
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!value) {
      setSelectedAccount(null)
      if (!isEditing) {
        setQuery('')
      }
      return
    }

    const inOptions = options.find((option) => option.id === value)
    if (inOptions) {
      setSelectedAccount(inOptions)
      if (!isEditing) {
        setQuery(getAccountLabel(inOptions))
      }
      return
    }

    if (onResolveAccount) {
      void onResolveAccount(value).then((resolved) => {
        if (resolved) {
          setSelectedAccount(resolved)
          if (!isEditing) {
            setQuery(getAccountLabel(resolved))
          }
        }
      })
    }
  }, [value, options, onResolveAccount, isEditing])

  useEffect(() => {
    if (!isOpen) return
    const handler = window.setTimeout(async () => {
      const term = query.trim()
      const results = await onSearch(term)
      setOptions(results)
      setLastQuery(term)
    }, 300)
    return () => window.clearTimeout(handler)
  }, [query, onSearch, isOpen])

  const selectionLabel = useMemo(() => {
    if (!selectedAccount) return 'Sin cuenta seleccionada.'
    return `Cuenta seleccionada: ${getAccountLabel(selectedAccount)}`
  }, [selectedAccount])

  const handleOpen = async () => {
    setIsOpen(true)
    setIsEditing(false)
    if (options.length === 0) {
      const results = await onSearch('')
      setOptions(results)
      setLastQuery('')
    }
  }

  const handleSelect = (option: ChartAccountListItem) => {
    setSelectedAccount(option)
    setQuery(getAccountLabel(option))
    setIsOpen(false)
    setIsEditing(false)
    onChange(option.id)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value
            setQuery(nextValue)
            setIsOpen(true)
            setIsEditing(true)
            if (!nextValue.trim()) {
              setSelectedAccount(null)
              setOptions([])
              setLastQuery('')
              onChange('')
            }
          }}
          onFocus={handleOpen}
          onBlur={() => setIsEditing(false)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
        />

        {isOpen ? (
          <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <span>
                {lastQuery
                  ? `Resultados para "${lastQuery}"`
                  : 'Sugerencias'}
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                  Buscando cuentas...
                </div>
              ) : options.length ? (
                options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-900 dark:text-slate-200 dark:hover:bg-slate-900"
                    onMouseDown={(event) => {
                      event.preventDefault()
                      handleSelect(option)
                    }}
                  >
                    <span className="font-medium">{getAccountLabel(option)}</span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                  No hay resultados.
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <p className="text-xs text-slate-500 dark:text-slate-400">{selectionLabel}</p>
    </div>
  )
}
