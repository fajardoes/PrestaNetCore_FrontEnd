import { useState } from 'react'
import { useFieldArray, useWatch, type Control, type FieldErrors } from 'react-hook-form'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { FeeModal } from '@/presentation/features/loans/products/components/fee-modal'

interface FeesEditorProps {
  control: Control<LoanProductFormValues>
  errors: FieldErrors<LoanProductFormValues>
  disabled?: boolean
  allowRemove?: boolean
  feeTypes: LoanCatalogItemDto[]
  feeChargeBases: LoanCatalogItemDto[]
  feeValueTypes: LoanCatalogItemDto[]
  feeChargeTimings: LoanCatalogItemDto[]
}

const getOptionLabel = (item: LoanCatalogItemDto) => `${item.code} - ${item.name}`

export const FeesEditor = ({
  control,
  disabled,
  allowRemove = true,
  feeTypes,
  feeChargeBases,
  feeValueTypes,
  feeChargeTimings,
}: FeesEditorProps) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'fees',
  })
  const fees = useWatch({ control, name: 'fees' }) ?? []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const openNewFeeModal = () => {
    setEditingIndex(null)
    setIsModalOpen(true)
  }

  const openEditFeeModal = (index: number) => {
    setEditingIndex(index)
    setIsModalOpen(true)
  }

  const handleSaveFee = (values: LoanProductFormValues['fees'][number]) => {
    if (editingIndex === null) {
      append(values)
    } else {
      update(editingIndex, values)
    }
    setIsModalOpen(false)
  }

  const handleToggleFee = (index: number) => {
    const current = fees[index]
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
            Comisiones/Cargos
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Agrega comisiones y activa o inactiva según aplique.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary px-3 py-1.5 text-xs shadow"
          onClick={openNewFeeModal}
          disabled={disabled}
        >
          Agregar comisión
        </button>
      </div>

      {fields.length ? (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const fee = fees[index]
            if (!fee) return null
            const feeType = feeTypes.find((item) => item.id === fee.feeTypeId)
            const chargeBase = feeChargeBases.find((item) => item.id === fee.chargeBaseId)
            const valueType = feeValueTypes.find((item) => item.id === fee.valueTypeId)
            const timing = feeChargeTimings.find((item) => item.id === fee.chargeTimingId)

            const isInactive = fee.isActive === false
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
                      {feeType ? getOptionLabel(feeType) : 'Comisión sin tipo'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Base: {chargeBase ? getOptionLabel(chargeBase) : 'Sin base'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Valor: {fee.value} · {valueType ? getOptionLabel(valueType) : 'Sin tipo'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cobro: {timing ? getOptionLabel(timing) : 'Sin momento'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      fee.isActive !== false
                        ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-50 dark:ring-emerald-500/40'
                        : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                    }`}
                  >
                    {fee.isActive !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-icon-label text-xs"
                    onClick={() => openEditFeeModal(index)}
                    disabled={disabled}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn-icon-label text-xs"
                    onClick={() => handleToggleFee(index)}
                    disabled={disabled}
                  >
                    {fee.isActive === false ? 'Activar' : 'Desactivar'}
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
          Aún no hay comisiones configuradas.
        </p>
      )}

      <FeeModal
        open={isModalOpen}
        initialValues={editingIndex !== null ? fees[editingIndex] : null}
        feeTypes={feeTypes}
        feeChargeBases={feeChargeBases}
        feeValueTypes={feeValueTypes}
        feeChargeTimings={feeChargeTimings}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveFee}
      />
    </div>
  )
}
