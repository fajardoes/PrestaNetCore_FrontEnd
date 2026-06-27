import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { insuranceSchema } from '@/infrastructure/validations/loans/loan-product-form.schema'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

type InsuranceFormValues = LoanProductFormValues['insurances'][number]

interface InsuranceModalProps {
  open: boolean
  initialValues?: InsuranceFormValues | null
  insuranceTypes: LoanCatalogItemDto[]
  insuranceCalculationBases: LoanCatalogItemDto[]
  insuranceValueTypes: LoanCatalogItemDto[]
  insuranceChargeTimings: LoanCatalogItemDto[]
  onClose: () => void
  onSubmit: (values: InsuranceFormValues) => void
}

const defaultValues: InsuranceFormValues = {
  id: null,
  insuranceTypeId: '',
  insuranceTypeName: null,
  calculationBaseId: '',
  calculationBaseName: null,
  valueTypeId: '',
  valueTypeName: null,
  value: 0,
  chargeTimingId: '',
  chargeTimingName: null,
  isMandatory: true,
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

export const InsuranceModal = ({
  open,
  initialValues,
  insuranceTypes,
  insuranceCalculationBases,
  insuranceValueTypes,
  insuranceChargeTimings,
  onClose,
  onSubmit,
}: InsuranceModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InsuranceFormValues>({
    resolver: yupResolver(insuranceSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? defaultValues)
    }
  }, [initialValues, open, reset])

  const insuranceTypeId = watch('insuranceTypeId')
  const calculationBaseId = watch('calculationBaseId')
  const valueTypeId = watch('valueTypeId')
  const chargeTimingId = watch('chargeTimingId')

  const insuranceTypeOptions = useMemo(
    () =>
      insuranceTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [insuranceTypes],
  )
  const calculationBaseOptions = useMemo(
    () =>
      insuranceCalculationBases.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [insuranceCalculationBases],
  )
  const valueTypeOptions = useMemo(
    () =>
      insuranceValueTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [insuranceValueTypes],
  )
  const chargeTimingOptions = useMemo(
    () =>
      insuranceChargeTimings.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [insuranceChargeTimings],
  )

  const submitHandler = handleSubmit((values) => onSubmit(values))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {initialValues ? 'Editar seguro' : 'Agregar seguro'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define el tipo, base, tipo de valor y momento de cobro.
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
                Tipo de seguro
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  insuranceTypeOptions.find((option) => option.value === insuranceTypeId) ??
                  null
                }
                onChange={(option) => {
                  setValue('insuranceTypeId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                  setValue('insuranceTypeName', option?.meta?.name ?? null)
                }}
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(insuranceTypeOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="insuranceTypeId"
                instanceId="loan-product-insurance-type-id"
                defaultOptions={insuranceTypeOptions}
                noOptionsMessage="Sin tipos de seguro"
              />
              <input type="hidden" {...register('id')} />
              <input type="hidden" {...register('insuranceTypeId')} />
              <input type="hidden" {...register('insuranceTypeName')} />
              {errors.insuranceTypeId ? (
                <p className="text-xs text-red-500">
                  {errors.insuranceTypeId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Base de cálculo
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  calculationBaseOptions.find((option) => option.value === calculationBaseId) ??
                  null
                }
                onChange={(option) => {
                  setValue('calculationBaseId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                  setValue('calculationBaseName', option?.meta?.name ?? null)
                }}
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(calculationBaseOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="calculationBaseId"
                instanceId="loan-product-insurance-calculation-base-id"
                defaultOptions={calculationBaseOptions}
                noOptionsMessage="Sin bases de cálculo"
              />
              <input type="hidden" {...register('calculationBaseId')} />
              <input type="hidden" {...register('calculationBaseName')} />
              {errors.calculationBaseId ? (
                <p className="text-xs text-red-500">
                  {errors.calculationBaseId.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de valor
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  valueTypeOptions.find((option) => option.value === valueTypeId) ??
                  null
                }
                onChange={(option) => {
                  setValue('valueTypeId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                  setValue('valueTypeName', option?.meta?.name ?? null)
                }}
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(valueTypeOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="valueTypeId"
                instanceId="loan-product-insurance-value-type-id"
                defaultOptions={valueTypeOptions}
                noOptionsMessage="Sin tipos de valor"
              />
              <input type="hidden" {...register('valueTypeId')} />
              <input type="hidden" {...register('valueTypeName')} />
              {errors.valueTypeId ? (
                <p className="text-xs text-red-500">
                  {errors.valueTypeId.message}
                </p>
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
              onChange={(option) => {
                setValue('chargeTimingId', option?.value ?? '', {
                  shouldValidate: true,
                })
                setValue('chargeTimingName', option?.meta?.name ?? null)
              }}
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(chargeTimingOptions, inputValue))
              }
              placeholder="Selecciona..."
              inputId="chargeTimingId"
              instanceId="loan-product-insurance-charge-timing-id"
              defaultOptions={chargeTimingOptions}
              noOptionsMessage="Sin momentos de cobro"
            />
            <input type="hidden" {...register('chargeTimingId')} />
            <input type="hidden" {...register('chargeTimingName')} />
            {errors.chargeTimingId ? (
              <p className="text-xs text-red-500">
                {errors.chargeTimingId.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isMandatory')}
              />
              <span>Obligatorio</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isActive')}
              />
              <span>Activo</span>
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
