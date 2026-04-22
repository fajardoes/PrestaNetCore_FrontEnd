import Select from 'react-select'
import type { OnChangeValue } from 'react-select'
import { reactSelectClassNames, reactSelectMenuPortalStyles } from './react-select-styles'

export interface SelectOption<TMeta = unknown> {
  value: string
  label: string
  meta?: TMeta
}

type SelectValue<TMeta, TIsMulti extends boolean> = TIsMulti extends true
  ? SelectOption<TMeta>[]
  : SelectOption<TMeta> | null

interface SelectFieldProps<TMeta = unknown, TIsMulti extends boolean = false> {
  value: SelectValue<TMeta, TIsMulti>
  onChange: (option: SelectValue<TMeta, TIsMulti>) => void
  options: SelectOption<TMeta>[]
  placeholder?: string
  inputId?: string
  instanceId?: string
  isClearable?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  noOptionsMessage?: string
  menuPortalTarget?: HTMLElement | null
  menuPosition?: 'absolute' | 'fixed'
  isMulti?: TIsMulti
}

const defaultNoOptions = () => 'Sin resultados'

const SelectField = <TMeta, TIsMulti extends boolean = false>({
  value,
  onChange,
  options,
  placeholder,
  inputId,
  instanceId,
  isClearable,
  isDisabled,
  isLoading,
  noOptionsMessage,
  menuPortalTarget,
  menuPosition,
  isMulti,
}: SelectFieldProps<TMeta, TIsMulti>) => {
  return (
    <Select
      unstyled
      options={options}
      inputId={inputId}
      instanceId={instanceId}
      value={value}
      onChange={(option: OnChangeValue<SelectOption<TMeta>, TIsMulti>) =>
        onChange((option ?? null) as SelectValue<TMeta, TIsMulti>)
      }
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

export default SelectField
