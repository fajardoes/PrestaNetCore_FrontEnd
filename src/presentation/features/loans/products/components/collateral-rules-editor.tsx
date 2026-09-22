import { useState } from 'react'
import { useFieldArray, useWatch, type Control, type FieldErrors } from 'react-hook-form'
import type { LoanProductFormValues } from '@/presentation/features/loans/products/components/loan-product-form.schema'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { CollateralRuleModal } from '@/presentation/features/loans/products/components/collateral-rule-modal'
import { TableActionButton } from '@/presentation/share/components/table-action-button'

interface CollateralRulesEditorProps {
  control: Control<LoanProductFormValues>
  errors: FieldErrors<LoanProductFormValues>
  disabled?: boolean
  allowRemove?: boolean
  collateralTypes: LoanCatalogItemDto[]
}

const getOptionLabel = (item: LoanCatalogItemDto) => item.name

export const CollateralRulesEditor = ({
  control,
  disabled,
  allowRemove = true,
  collateralTypes,
}: CollateralRulesEditorProps) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'collateralRules',
  })
  const collateralRules = useWatch({ control, name: 'collateralRules' }) ?? []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const openNewRuleModal = () => {
    setEditingIndex(null)
    setIsModalOpen(true)
  }

  const openEditRuleModal = (index: number) => {
    setEditingIndex(index)
    setIsModalOpen(true)
  }

  const handleSaveRule = (values: LoanProductFormValues['collateralRules'][number]) => {
    if (editingIndex === null) {
      append(values)
    } else {
      update(editingIndex, values)
    }
    setIsModalOpen(false)
  }

  const handleToggleRule = (index: number) => {
    const current = collateralRules[index]
    if (!current) return
    update(index, {
      ...current,
      isActive: current.isActive === false,
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="btn-primary btn-list-action shadow"
          onClick={openNewRuleModal}
          disabled={disabled}
        >
          Agregar regla
        </button>
      </div>

      {fields.length ? (
        <div className="space-y-2">
          {fields.map((field, index) => {
            const rule = collateralRules[index]
            if (!rule) return null
            const collateralType = collateralTypes.find(
              (item) => item.id === rule.collateralTypeId,
            )

            const isInactive = rule.isActive === false
            return (
              <div
                key={field.id}
                className={`space-y-2 rounded-lg border p-2.5 ${
                  isInactive
                    ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-500/10'
                    : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {collateralType
                        ? getOptionLabel(collateralType)
                        : 'Garantía sin tipo'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Ratio mínimo: {rule.minCoverageRatio}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Máximo ítems: {rule.maxItems ?? 'Sin límite'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                      rule.isActive !== false
                        ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-50 dark:ring-sky-500/40'
                        : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                    }`}
                  >
                    {rule.isActive !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TableActionButton
                    icon="edit"
                    label="Editar regla de garantía"
                    onClick={() => openEditRuleModal(index)}
                    disabled={disabled}
                  />
                  <TableActionButton
                    icon="toggle"
                    label={rule.isActive === false ? 'Activar regla de garantía' : 'Desactivar regla de garantía'}
                    onClick={() => handleToggleRule(index)}
                    disabled={disabled}
                  />
                  {allowRemove ? (
                    <TableActionButton
                      icon="delete"
                      label="Eliminar regla de garantía"
                      className="text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                      onClick={() => remove(index)}
                      disabled={disabled}
                    />
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aún no hay reglas de garantías configuradas.
        </p>
      )}

      <CollateralRuleModal
        open={isModalOpen}
        initialValues={editingIndex !== null ? collateralRules[editingIndex] : null}
        collateralTypes={collateralTypes}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveRule}
      />
    </div>
  )
}
