import { useState } from 'react'
import { useFieldArray, useWatch, type Control, type FieldErrors } from 'react-hook-form'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { InsuranceModal } from '@/presentation/features/loans/products/components/insurance-modal'

interface InsurancesEditorProps {
  control: Control<LoanProductFormValues>
  errors: FieldErrors<LoanProductFormValues>
  disabled?: boolean
  allowRemove?: boolean
  insuranceTypes: LoanCatalogItemDto[]
  insuranceCalculationBases: LoanCatalogItemDto[]
  insuranceCoveragePeriods: LoanCatalogItemDto[]
  insuranceChargeTimings: LoanCatalogItemDto[]
}

const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`

export const InsurancesEditor = ({
  control,
  disabled,
  allowRemove = true,
  insuranceTypes,
  insuranceCalculationBases,
  insuranceCoveragePeriods,
  insuranceChargeTimings,
}: InsurancesEditorProps) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'insurances',
  })
  const insurances = useWatch({ control, name: 'insurances' }) ?? []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const openNewInsuranceModal = () => {
    setEditingIndex(null)
    setIsModalOpen(true)
  }

  const openEditInsuranceModal = (index: number) => {
    setEditingIndex(index)
    setIsModalOpen(true)
  }

  const handleSaveInsurance = (values: LoanProductFormValues['insurances'][number]) => {
    if (editingIndex === null) {
      append(values)
    } else {
      update(editingIndex, values)
    }
    setIsModalOpen(false)
  }

  const handleToggleInsurance = (index: number) => {
    const current = insurances[index]
    if (!current) return
    update(index, {
      ...current,
      isActive: current.isActive === false,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Seguros
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configura seguros y activa o inactiva según el producto.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary px-3 py-1.5 text-xs shadow"
          onClick={openNewInsuranceModal}
          disabled={disabled}
        >
          Agregar seguro
        </button>
      </div>

      {fields.length ? (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const insurance = insurances[index]
            if (!insurance) return null
            const insuranceType = insuranceTypes.find(
              (item) => item.id === insurance.insuranceTypeId,
            )
            const calculationBase = insuranceCalculationBases.find(
              (item) => item.id === insurance.calculationBaseId,
            )
            const coverage = insuranceCoveragePeriods.find(
              (item) => item.id === insurance.coveragePeriodId,
            )
            const timing = insuranceChargeTimings.find(
              (item) => item.id === insurance.chargeTimingId,
            )

            const isInactive = insurance.isActive === false
            return (
              <div
                key={field.id}
                className={`space-y-2 rounded-xl border p-3 ${
                  isInactive
                    ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {insuranceType ? getOptionLabel(insuranceType) : 'Seguro sin tipo'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Base: {calculationBase ? getOptionLabel(calculationBase) : 'Sin base'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cobertura: {coverage ? getOptionLabel(coverage) : 'Sin cobertura'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tasa: {insurance.rate} ·{' '}
                      {timing ? getOptionLabel(timing) : 'Sin momento'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      insurance.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-50 dark:ring-emerald-500/40'
                        : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                    }`}
                  >
                    {insurance.isActive !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-icon-label text-xs"
                    onClick={() => openEditInsuranceModal(index)}
                    disabled={disabled}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-icon-label text-xs"
                    onClick={() => handleToggleInsurance(index)}
                    disabled={disabled}
                  >
                    {insurance.isActive === false ? 'Activar' : 'Desactivar'}
                  </button>
                  {allowRemove ? (
                    <button
                      type="button"
                      className="btn-icon-label text-xs text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                      onClick={() => remove(index)}
                      disabled={disabled}
                    >
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay seguros configurados.
        </p>
      )}

      <InsuranceModal
        open={isModalOpen}
        initialValues={editingIndex !== null ? insurances[editingIndex] : null}
        insuranceTypes={insuranceTypes}
        insuranceCalculationBases={insuranceCalculationBases}
        insuranceCoveragePeriods={insuranceCoveragePeriods}
        insuranceChargeTimings={insuranceChargeTimings}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveInsurance}
      />
    </div>
  )
}
