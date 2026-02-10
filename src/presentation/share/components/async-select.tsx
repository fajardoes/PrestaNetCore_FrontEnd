import AsyncSelect from 'react-select/async'
import type { SingleValue } from 'react-select'

export interface AsyncSelectOption<TMeta = unknown> {
  value: string
  label: string
  meta?: TMeta
}

interface AsyncSelectFieldProps<TMeta = unknown> {
  value: AsyncSelectOption<TMeta> | null
  onChange: (option: AsyncSelectOption<TMeta> | null) => void
  loadOptions: (inputValue: string) => Promise<AsyncSelectOption<TMeta>[]>
  placeholder?: string
  inputId?: string
  instanceId?: string
  defaultOptions?: boolean | AsyncSelectOption<TMeta>[]
  isClearable?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  noOptionsMessage?: string
  menuPortalTarget?: HTMLElement | null
  menuPosition?: 'absolute' | 'fixed'
}

const classNames = {
  control: (state: { isFocused: boolean; isDisabled: boolean }) =>
    [
      'min-h-[42px] w-full rounded-lg border px-2 text-sm shadow-sm transition',
      state.isDisabled ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-white dark:bg-slate-900',
      state.isFocused
        ? 'border-primary ring-2 ring-primary/30'
        : 'border-slate-300 dark:border-slate-700',
    ].join(' '),
  valueContainer: () => 'px-1',
  input: () => 'text-sm text-slate-900 dark:text-slate-100',
  placeholder: () => 'text-sm text-slate-400',
  singleValue: () => 'text-sm text-slate-900 dark:text-slate-100',
  indicatorsContainer: () => 'text-slate-400',
  menu: () =>
    'mt-2 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900',
  option: (state: { isFocused: boolean; isSelected: boolean }) =>
    [
      'px-3 py-2 text-sm',
      state.isFocused ? 'bg-slate-100 dark:bg-slate-800' : '',
      state.isSelected
        ? 'font-semibold text-slate-900 dark:text-slate-50'
        : 'text-slate-700 dark:text-slate-200',
    ].join(' '),
  noOptionsMessage: () => 'px-3 py-2 text-sm text-slate-500 dark:text-slate-400',
  loadingMessage: () => 'px-3 py-2 text-sm text-slate-500 dark:text-slate-400',
}

const defaultNoOptions = () => 'Sin resultados'

const AsyncSelectField = <TMeta,>({
  value,
  onChange,
  loadOptions,
  placeholder,
  inputId,
  instanceId,
  defaultOptions,
  isClearable,
  isDisabled,
  isLoading,
  noOptionsMessage,
  menuPortalTarget,
  menuPosition,
}: AsyncSelectFieldProps<TMeta>) => {
  return (
    <AsyncSelect
      unstyled
      cacheOptions
      defaultOptions={defaultOptions ?? false}
      inputId={inputId}
      instanceId={instanceId}
      value={value}
      onChange={(option: SingleValue<AsyncSelectOption<TMeta>>) =>
        onChange(option ?? null)
      }
      loadOptions={loadOptions}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      classNames={classNames}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      styles={
        menuPortalTarget
          ? {
              menuPortal: (base) => ({ ...base, zIndex: 60 }),
            }
          : undefined
      }
      noOptionsMessage={noOptionsMessage ? () => noOptionsMessage : defaultNoOptions}
    />
  )
}

export default AsyncSelectField
