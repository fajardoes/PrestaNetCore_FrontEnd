import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

interface InsurancesEditorProps {
  control: Control<LoanProductFormValues>
  register: UseFormRegister<LoanProductFormValues>
  errors: FieldErrors<LoanProductFormValues>
  disabled?: boolean
  allowRemove?: boolean
  insuranceTypes: LoanCatalogItemDto[]
  insuranceCalculationBases: LoanCatalogItemDto[]
  insuranceCoveragePeriods: LoanCatalogItemDto[]
  insuranceChargeTimings: LoanCatalogItemDto[]
}

const toNumberValue = (value: string) => (value === '' ? undefined : Number(value))
const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`

export const InsurancesEditor = ({
  control,
  register,
  errors,
  disabled,
  allowRemove = true,
  insuranceTypes,
  insuranceCalculationBases,
  insuranceCoveragePeriods,
  insuranceChargeTimings,
}: InsurancesEditorProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'insurances',
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Seguros
        </h4>
        <button
          type="button"
          className="btn-secondary px-3 py-1 text-xs"
          onClick={() =>
            append({
              insuranceTypeId: '',
              calculationBaseId: '',
              coveragePeriodId: '',
              rate: 0,
              chargeTimingId: '',
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
                    {...register(`insurances.${index}.insuranceTypeId`)}
                    disabled={disabled}
                  >
                    <option value="">Selecciona un tipo</option>
                    {insuranceTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                  {errors.insurances?.[index]?.insuranceTypeId ? (
                    <p className="text-xs text-red-500">
                      {errors.insurances[index]?.insuranceTypeId?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Base cálculo
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`insurances.${index}.calculationBaseId`)}
                    disabled={disabled}
                  >
                    <option value="">Selecciona una base</option>
                    {insuranceCalculationBases.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                  {errors.insurances?.[index]?.calculationBaseId ? (
                    <p className="text-xs text-red-500">
                      {errors.insurances[index]?.calculationBaseId?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Cobertura
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`insurances.${index}.coveragePeriodId`)}
                    disabled={disabled}
                  >
                    <option value="">Selecciona un período</option>
                    {insuranceCoveragePeriods.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                  {errors.insurances?.[index]?.coveragePeriodId ? (
                    <p className="text-xs text-red-500">
                      {errors.insurances[index]?.coveragePeriodId?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Tasa
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`insurances.${index}.rate`, {
                      setValueAs: toNumberValue,
                    })}
                    disabled={disabled}
                  />
                  {errors.insurances?.[index]?.rate ? (
                    <p className="text-xs text-red-500">
                      {errors.insurances[index]?.rate?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Momento
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register(`insurances.${index}.chargeTimingId`)}
                    disabled={disabled}
                  >
                    <option value="">Selecciona un momento</option>
                    {insuranceChargeTimings.map((item) => (
                      <option key={item.id} value={item.id}>
                        {getOptionLabel(item)}
                      </option>
                    ))}
                  </select>
                  {errors.insurances?.[index]?.chargeTimingId ? (
                    <p className="text-xs text-red-500">
                      {errors.insurances[index]?.chargeTimingId?.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40 dark:border-slate-700"
                      {...register(`insurances.${index}.isActive`)}
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
          Aún no hay seguros configurados.
        </p>
      )}
    </div>
  )
}
