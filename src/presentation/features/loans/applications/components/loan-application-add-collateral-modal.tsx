import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import {
  loanApplicationCollateralSchema,
  type LoanApplicationCollateralFormValues,
} from '@/infrastructure/validations/loans/loan-application-collateral.schema'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'

interface LoanApplicationAddCollateralModalProps {
  open: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: LoanApplicationCollateralFormValues) => Promise<void> | void
  searchCollaterals: (
    input: string,
  ) => Promise<AsyncSelectOption<CollateralResponseDto>[]>
}

const defaultValues: LoanApplicationCollateralFormValues = {
  collateralId: '',
  coverageValue: null,
  notes: null,
}

export const LoanApplicationAddCollateralModal = ({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
  searchCollaterals,
}: LoanApplicationAddCollateralModalProps) => {
  const [selectedCollateral, setSelectedCollateral] =
    useState<AsyncSelectOption<CollateralResponseDto> | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanApplicationCollateralFormValues>({
    resolver: yupResolver(loanApplicationCollateralSchema),
    defaultValues,
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Agregar garantía
        </h3>

        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
            setSelectedCollateral(null)
            reset(defaultValues)
          })}
        >
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Garantía (obligatoria)
            </label>
            <Controller
              control={control}
              name="collateralId"
              render={({ field }) => (
                <AsyncSelect<CollateralResponseDto>
                  value={selectedCollateral}
                  onChange={(option) => {
                    setSelectedCollateral(option)
                    field.onChange(option?.value ?? '')
                  }}
                  loadOptions={searchCollaterals}
                  defaultOptions
                  isClearable
                  placeholder="Buscar por referencia, descripción o tipo..."
                  noOptionsMessage="No hay garantías disponibles para este cliente."
                  isDisabled={isSubmitting}
                />
              )}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Se muestran garantías disponibles del cliente. También puedes buscar por texto.
            </p>
            {errors.collateralId ? (
              <p className="text-xs text-red-600 dark:text-red-300">{errors.collateralId.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Cobertura (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('coverageValue', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si la dejas vacía, se usará el valor de avalúo de la garantía.
            </p>
            {errors.coverageValue ? (
              <p className="text-xs text-red-600 dark:text-red-300">{errors.coverageValue.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notas</label>
            <textarea
              rows={2}
              maxLength={250}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes ? (
              <p className="text-xs text-red-600 dark:text-red-300">{errors.notes.message}</p>
            ) : null}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={() => {
                setSelectedCollateral(null)
                reset(defaultValues)
                onClose()
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
