import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import type { LoanApplicationFinancialProfileFormValues } from '@/infrastructure/validations/loans/loan-application-financial-profile.schema'

const enabledFieldClass =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20'

const disabledFieldClass =
  'w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 shadow-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'

const resolveFieldClass = (disabled: boolean, minWidthClass = '') =>
  `${disabled ? disabledFieldClass : enabledFieldClass}${minWidthClass ? ` ${minWidthClass}` : ''}`

interface LoanApplicationFinancialOtherLiabilitiesTableProps {
  control: Control<LoanApplicationFinancialProfileFormValues>
  register: UseFormRegister<LoanApplicationFinancialProfileFormValues>
  errors: FieldErrors<LoanApplicationFinancialProfileFormValues>
  disabled?: boolean
}

export const LoanApplicationFinancialOtherLiabilitiesTable = ({
  control,
  register,
  errors,
  disabled = false,
}: LoanApplicationFinancialOtherLiabilitiesTableProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherLiabilities',
    keyName: 'fieldKey',
  })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Otros pasivos
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            La colección completa se sincroniza al guardar.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary px-3 py-1.5 text-xs"
          disabled={disabled}
          onClick={() =>
            append({
              id: null,
              description: '',
              amount: 0,
              sortOrder: fields.length + 1,
            })
          }
        >
          Agregar pasivo
        </button>
      </div>

      {fields.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  #
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Descripcion
                </th>
                <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Monto
                </th>
                <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Accion
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
              {fields.map((field, index) => {
                const descriptionError = errors.otherLiabilities?.[index]?.description?.message
                const amountError = errors.otherLiabilities?.[index]?.amount?.message

                return (
                  <tr key={field.fieldKey}>
                    <td className="px-3 py-2 align-top text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {index + 1}
                      <input type="hidden" {...register(`otherLiabilities.${index}.id`)} />
                      <input type="hidden" {...register(`otherLiabilities.${index}.sortOrder`)} />
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="text"
                        maxLength={250}
                        disabled={disabled}
                        className={resolveFieldClass(disabled)}
                        {...register(`otherLiabilities.${index}.description`)}
                      />
                      {descriptionError ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                          {descriptionError}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={disabled}
                        className={resolveFieldClass(disabled, 'min-w-[140px]')}
                        {...register(`otherLiabilities.${index}.amount`)}
                      />
                      {amountError ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-300">{amountError}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      <button
                        type="button"
                        className="btn-table-action text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                        disabled={disabled}
                        onClick={() => remove(index)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
          No se han registrado otros pasivos.
        </div>
      )}
    </div>
  )
}
