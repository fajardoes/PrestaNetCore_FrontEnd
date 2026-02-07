import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { collateralRuleSchema } from '@/infrastructure/validations/loans/loan-product-form.schema'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

type CollateralRuleFormValues = LoanProductFormValues['collateralRules'][number]

interface CollateralRuleModalProps {
  open: boolean
  initialValues?: CollateralRuleFormValues | null
  collateralTypes: LoanCatalogItemDto[]
  onClose: () => void
  onSubmit: (values: CollateralRuleFormValues) => void
}

const defaultValues: CollateralRuleFormValues = {
  collateralTypeId: '',
  minCoverageRatio: 0,
  maxItems: null,
  isActive: true,
}

const toNumberValue = (value: string) => (value === '' ? undefined : Number(value))
const toOptionalNumber = (value: string) => (value === '' ? null : Number(value))
const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`
const filterOptions = (
  options: AsyncSelectOption<LoanCatalogItemDto>[],
  inputValue: string,
) => {
  const term = inputValue.trim().toLowerCase()
  if (!term) return options
  return options.filter((option) => option.label.toLowerCase().includes(term))
}

export const CollateralRuleModal = ({
  open,
  initialValues,
  collateralTypes,
  onClose,
  onSubmit,
}: CollateralRuleModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollateralRuleFormValues>({
    resolver: yupResolver(collateralRuleSchema),
    defaultValues,
  })

  useEffect(() => {
    if (open) {
      reset(initialValues ?? defaultValues)
    }
  }, [initialValues, open, reset])

  const collateralTypeId = watch('collateralTypeId')
  const collateralTypeOptions = useMemo(
    () =>
      collateralTypes.map((item) => ({
        value: item.id,
        label: getOptionLabel(item),
        meta: item,
      })),
    [collateralTypes],
  )

  const submitHandler = handleSubmit((values) => onSubmit(values))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {initialValues ? 'Editar regla de garantía' : 'Agregar regla de garantía'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define el tipo, ratio mínimo y límite de ítems.
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
                Tipo de garantía
              </label>
              <AsyncSelect<LoanCatalogItemDto>
                value={
                  collateralTypeOptions.find((option) => option.value === collateralTypeId) ??
                  null
                }
                onChange={(option) =>
                  setValue('collateralTypeId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) =>
                  Promise.resolve(filterOptions(collateralTypeOptions, inputValue))
                }
                placeholder="Selecciona..."
                inputId="collateralTypeId"
                instanceId="loan-product-collateral-type-id"
                defaultOptions={collateralTypeOptions}
                noOptionsMessage="Sin tipos de garantía"
              />
              <input type="hidden" {...register('collateralTypeId')} />
              {errors.collateralTypeId ? (
                <p className="text-xs text-red-500">
                  {errors.collateralTypeId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Ratio mínimo cobertura
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('minCoverageRatio', { setValueAs: toNumberValue })}
              />
              {errors.minCoverageRatio ? (
                <p className="text-xs text-red-500">
                  {errors.minCoverageRatio.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Máximo de ítems (opcional)
            </label>
            <input
              type="number"
              step="1"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('maxItems', { setValueAs: toOptionalNumber })}
            />
            {errors.maxItems ? (
              <p className="text-xs text-red-500">{errors.maxItems.message}</p>
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
