import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { feeSchema } from '@/infrastructure/validations/loans/loan-product-form.schema'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

type FeeFormValues = LoanProductFormValues['fees'][number]

interface FeeModalProps {
  open: boolean
  initialValues?: FeeFormValues | null
  feeTypes: LoanCatalogItemDto[]
  feeChargeBases: LoanCatalogItemDto[]
  feeValueTypes: LoanCatalogItemDto[]
  feeChargeTimings: LoanCatalogItemDto[]
  onClose: () => void
  onSubmit: (values: FeeFormValues) => void
}

const defaultValues: FeeFormValues = {
  feeTypeId: '',
  chargeBaseId: '',
  valueTypeId: '',
  value: 0,
  chargeTimingId: '',
  isActive: true,
}

const toNumberValue = (value: string) => (value === '' ? undefined : Number(value))
const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`
const filterOptions = (
  options: AsyncSelectOption<LoanCatalogItemDto>[],
  inputValue: string,
) => {
  const term = inputValue.trim().toLowerCase()
  if (!term) return options
  return options.filter((option) => option.label.toLowerCase().includes(term))
}

export const FeeModal = ({
  open,
  initialValues,
  feeTypes,
  feeChargeBases,
  feeValueTypes,
  feeChargeTimings,
  onClose,
  onSubmit,
}: FeeModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeeFormValues>({
    resolver: yupResolver(feeSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? defaultValues)
    }
  }, [initialValues, open, reset])

  const feeTypeId = watch('feeTypeId')
  const chargeBaseId = watch('chargeBaseId')
  const valueTypeId = watch('valueTypeId')
  const chargeTimingId = watch('chargeTimingId')

  const feeTypeOptions = useMemo(
    () =>
      feeTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [feeTypes],
  )
  const chargeBaseOptions = useMemo(
    () =>
      feeChargeBases.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [feeChargeBases],
  )
  const valueTypeOptions = useMemo(
    () =>
      feeValueTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [feeValueTypes],
  )
  const chargeTimingOptions = useMemo(
    () =>
      feeChargeTimings.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [feeChargeTimings],
  )

  const submitHandler = handleSubmit((values) => onSubmit(values))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {initialValues ? 'Editar comisión' : 'Agregar comisión'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configura tipo, base, valor y momento de cobro.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3" role="presentation">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de comisión
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={feeTypeOptions.find((option) => option.value === feeTypeId) ?? null}
                onChange={(option) =>
                  setValue('feeTypeId', option?.value ?? '', { shouldValidate: true })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(feeTypeOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="feeTypeId"
                instanceId="loan-product-fee-type-id"
                defaultOptions={feeTypeOptions}
                noOptionsMessage="Sin tipos de comisión"
              />
              <input type="hidden" {...register('feeTypeId')} />
              {errors.feeTypeId ? (
                <p className="text-xs text-red-500">{errors.feeTypeId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Base de cobro
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={chargeBaseOptions.find((option) => option.value === chargeBaseId) ?? null}
                onChange={(option) =>
                  setValue('chargeBaseId', option?.value ?? '', { shouldValidate: true })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(chargeBaseOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="chargeBaseId"
                instanceId="loan-product-fee-charge-base-id"
                defaultOptions={chargeBaseOptions}
                noOptionsMessage="Sin bases de cobro"
              />
              <input type="hidden" {...register('chargeBaseId')} />
              {errors.chargeBaseId ? (
                <p className="text-xs text-red-500">{errors.chargeBaseId.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de valor
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={valueTypeOptions.find((option) => option.value === valueTypeId) ?? null}
                onChange={(option) =>
                  setValue('valueTypeId', option?.value ?? '', { shouldValidate: true })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(valueTypeOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="valueTypeId"
                instanceId="loan-product-fee-value-type-id"
                defaultOptions={valueTypeOptions}
                noOptionsMessage="Sin tipos de valor"
              />
              <input type="hidden" {...register('valueTypeId')} />
              {errors.valueTypeId ? (
                <p className="text-xs text-red-500">{errors.valueTypeId.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Valor
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('value', { setValueAs: toNumberValue })}
              />
              {errors.value ? (
                <p className="text-xs text-red-500">{errors.value.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Momento de cobro
            </label>
            <AsyncSelect<LoanCatalogItemDto>
              value={
                chargeTimingOptions.find((option) => option.value === chargeTimingId) ?? null
              }
              onChange={(option) =>
                setValue('chargeTimingId', option?.value ?? '', { shouldValidate: true })
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(chargeTimingOptions, inputValue))
              }
              placeholder="Selecciona..."
              inputId="chargeTimingId"
              instanceId="loan-product-fee-charge-timing-id"
              defaultOptions={chargeTimingOptions}
              noOptionsMessage="Sin momentos de cobro"
            />
            <input type="hidden" {...register('chargeTimingId')} />
            {errors.chargeTimingId ? (
              <p className="text-xs text-red-500">{errors.chargeTimingId.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isActive')}
              />
              <span>Activa</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary px-5 py-2 text-sm shadow"
              onClick={submitHandler}
            >
              {initialValues ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
