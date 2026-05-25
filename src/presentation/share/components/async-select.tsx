import AsyncSelect from 'react-select/async'
import type { OnChangeValue } from 'react-select'
import { reactSelectClassNames, reactSelectMenuPortalStyles } from './react-select-styles'

export interface AsyncSelectOption<TMeta = unknown> {
  value: string
  label: string
  meta?: TMeta
}

type AsyncSelectValue<TMeta, TIsMulti extends boolean> = TIsMulti extends true
  ? AsyncSelectOption<TMeta>[]
  : AsyncSelectOption<TMeta> | null

interface AsyncSelectFieldProps<TMeta = unknown, TIsMulti extends boolean = false> {
  value: AsyncSelectValue<TMeta, TIsMulti>
  onChange: (option: AsyncSelectValue<TMeta, TIsMulti>) => void
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
  isMulti?: TIsMulti
}

const defaultNoOptions = () => 'Sin resultados'

const AsyncSelectField = <TMeta, TIsMulti extends boolean = false>({
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
  isMulti,
}: AsyncSelectFieldProps<TMeta, TIsMulti>) => {
  return (
    <AsyncSelect
      unstyled
      cacheOptions
      defaultOptions={defaultOptions ?? false}
      inputId={inputId}
      instanceId={instanceId}
      value={value}
      onChange={(option: OnChangeValue<AsyncSelectOption<TMeta>, TIsMulti>) =>
        onChange((option ?? null) as AsyncSelectValue<TMeta, TIsMulti>)
      }
      loadOptions={loadOptions}
      placeholder={placeholder}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isMulti={isMulti}
      classNames={reactSelectClassNames}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      styles={menuPortalTarget ? reactSelectMenuPortalStyles : undefined}
      noOptionsMessage={noOptionsMessage ? () => noOptionsMessage : defaultNoOptions}
    />
  )
}

export default AsyncSelectField
