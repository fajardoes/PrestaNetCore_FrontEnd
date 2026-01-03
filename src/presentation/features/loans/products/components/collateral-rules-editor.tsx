import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

interface CollateralRulesEditorProps {
  control: Control<LoanProductFormValues>
  register: UseFormRegister<LoanProductFormValues>
  errors: FieldErrors<LoanProductFormValues>
  disabled?: boolean
  allowRemove?: boolean
  collateralTypes: LoanCatalogItemDto[]
}

const toNumberValue = (value: string) => (value === '' ? undefined : Number(value))
const toOptionalNumber = (value: string) => (value === '' ? null : Number(value))
const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`

export const CollateralRulesEditor = ({
  control,
  register,
  errors,
  disabled,
  allowRemove = true,
  collateralTypes,
}: CollateralRulesEditorProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'collateralRules',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Reglas de garantías
        </h4>
        <button
          type="button"
          className="btn-secondary px-3 py-1 text-xs"
          onClick={() =>
            append({
              collateralTypeId: '',
              minCoverageRatio: 0,
              maxItems: null,
              isActive: true,
            })
          }
          disabled={disabled}
        >
          Agregar
        </button>
      </div>

      {fields.length ? (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Tipo
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`collateralRules.${index}.collateralTypeId`)}
                    disabled={disabled}
                  >
                    <option value="">Selecciona un tipo</option>
                    {collateralTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                  {errors.collateralRules?.[index]?.collateralTypeId ? (
                    <p className="text-xs text-red-500">
                      {errors.collateralRules[index]?.collateralTypeId?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Ratio mínimo cobertura
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`collateralRules.${index}.minCoverageRatio`, {
                      setValueAs: toNumberValue,
                    })}
                    disabled={disabled}
                  />
                  {errors.collateralRules?.[index]?.minCoverageRatio ? (
                    <p className="text-xs text-red-500">
                      {errors.collateralRules[index]?.minCoverageRatio?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Máximo de ítems (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`collateralRules.${index}.maxItems`, {
                      setValueAs: toOptionalNumber,
                    })}
                    disabled={disabled}
                  />
                  {errors.collateralRules?.[index]?.maxItems ? (
                    <p className="text-xs text-red-500">
                      {errors.collateralRules[index]?.maxItems?.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40 dark:border-slate-700"
                      {...register(`collateralRules.${index}.isActive`)}
                      disabled={disabled}
                    />
                    Activo
                  </label>
                  {allowRemove ? (
                    <button
                      type="button"
                      className="btn-icon-label text-xs text-red-600 dark:text-red-400"
                      onClick={() => remove(index)}
                      disabled={disabled}
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay reglas de garantías configuradas.
        </p>
      )}
    </div>
  )
}
