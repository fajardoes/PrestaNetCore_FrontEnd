import { Plus } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PaymentComponentPriorityResponse } from '@/infrastructure/payments/responses/payment-component-priority-response'
import type { PaymentComponentPriorityFormValues } from '@/infrastructure/validations/payments/payment-component-priority.schema'
import { useNotifications } from '@/providers/NotificationProvider'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { PaymentComponentPrioritiesTable } from '@/presentation/features/payments/components/payment-component-priorities-table'
import { PaymentComponentPriorityFormModal } from '@/presentation/features/payments/components/payment-component-priority-form-modal'
import { buildPriorityReorderPayload } from '@/presentation/features/payments/components/payment-ui'
import { usePaymentComponentPriorities } from '@/presentation/features/payments/hooks/use-payment-component-priorities'
import { usePaymentComponentPriorityMutations } from '@/presentation/features/payments/hooks/use-payment-component-priority-mutations'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'

const swapItems = (
  items: PaymentComponentPriorityResponse[],
  sourceIndex: number,
  targetIndex: number,
) => {
  const next = items.slice()
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  return next
}

export const PaymentComponentPrioritiesPage = () => {
  const { notify } = useNotifications()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canRead = hasPermission('payments.component_priorities.read')
  const canManage = hasPermission('payments.component_priorities.manage')
  const { items, isLoading, error, refresh, setItems } = usePaymentComponentPriorities(canRead)
  const mutations = usePaymentComponentPriorityMutations()

  const [editingItem, setEditingItem] = useState<PaymentComponentPriorityResponse | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [pendingDeactivate, setPendingDeactivate] =
    useState<PaymentComponentPriorityResponse | null>(null)
  const [isManualReorderDirty, setIsManualReorderDirty] = useState(false)

  const currentOrderKey = useMemo(() => items.map((item) => item.id).join('|'), [items])
  const initialOrderKeyRef = useRef('')

  useEffect(() => {
    if (currentOrderKey && (!initialOrderKeyRef.current || !isManualReorderDirty)) {
      initialOrderKeyRef.current = currentOrderKey
    }
  }, [currentOrderKey, isManualReorderDirty])

  const hasDraftReorder =
    Boolean(initialOrderKeyRef.current) && initialOrderKeyRef.current !== currentOrderKey

  const resetEditor = () => {
    setIsCreateOpen(false)
    setEditingItem(null)
    mutations.setError(null)
  }

  const handleSubmit = async (values: PaymentComponentPriorityFormValues) => {
    const payload = {
      componentCode: values.componentCode.trim().toUpperCase(),
      componentName: values.componentName.trim(),
      priorityOrder: values.priorityOrder,
      isActive: values.isActive,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    }

    if (editingItem) {
      const result = await mutations.update(editingItem.id, payload)
      if (!result.success) return
      notify('Prioridad actualizada correctamente.', 'success')
      setIsManualReorderDirty(false)
      resetEditor()
      await refresh()
      return
    }

    const createResult = await mutations.create({
      componentCode: payload.componentCode,
      componentName: payload.componentName,
      priorityOrder: payload.priorityOrder,
      notes: payload.notes,
    })
    if (!createResult.success) return
    notify('Prioridad creada correctamente.', 'success')
    setIsManualReorderDirty(false)
    resetEditor()
    await refresh()
  }

  const handleMove = (itemId: string, direction: -1 | 1) => {
    const currentIndex = items.findIndex((item) => item.id === itemId)
    if (currentIndex < 0) return
    const nextIndex = currentIndex + direction
    if (nextIndex < 0 || nextIndex >= items.length) return
    setIsManualReorderDirty(true)
    setItems(swapItems(items, currentIndex, nextIndex))
  }

  const handleSaveOrder = async () => {
    const result = await mutations.reorder(buildPriorityReorderPayload(items))
    if (!result.success) return
    notify('Orden de cobro actualizado correctamente.', 'success')
    setItems(result.data)
    initialOrderKeyRef.current = result.data.map((item) => item.id).join('|')
    setIsManualReorderDirty(false)
  }

  const handleDeactivate = async () => {
    if (!pendingDeactivate) return
    const result = await mutations.deactivate(pendingDeactivate.id)
    if (!result.success) return
    notify('Prioridad desactivada correctamente.', 'success')
    setIsManualReorderDirty(false)
    setPendingDeactivate(null)
    await refresh()
  }

  if (!isLoadingPermissions && !canRead) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">Tu usuario no tiene permiso para consultar prioridades de cobro.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Prioridades de cobro
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Define el orden en que backend aplica pagos sobre componentes financieros.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasDraftReorder && canManage ? (
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={mutations.isReordering}
              onClick={() => void handleSaveOrder()}
            >
              {mutations.isReordering ? 'Guardando orden...' : 'Guardar orden'}
            </button>
          ) : null}
          {canManage ? (
            <button
              type="button"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nueva prioridad
            </button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Los componentes sin prioridad configurada quedan al final. Usa las flechas para reordenar y guarda el orden cuando termines.
      </div>

      <PaymentComponentPrioritiesTable
        items={items}
        isLoading={isLoading || isLoadingPermissions}
        error={error}
        canManage={canManage}
        onEdit={(item) => {
          mutations.setError(null)
          setIsCreateOpen(false)
          setEditingItem(item)
        }}
        onDeactivate={setPendingDeactivate}
        onMoveUp={(itemId) => handleMove(itemId, -1)}
        onMoveDown={(itemId) => handleMove(itemId, 1)}
      />

      <PaymentComponentPriorityFormModal
        open={isCreateOpen || Boolean(editingItem)}
        priority={editingItem}
        isSaving={mutations.isSaving}
        error={mutations.error}
        onClose={resetEditor}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(pendingDeactivate)}
        title="Desactivar prioridad"
        description="La prioridad dejará de formar parte del orden de cobro activo."
        confirmLabel="Desactivar"
        isProcessing={mutations.isDeactivating}
        onCancel={() => {
          setPendingDeactivate(null)
          mutations.setError(null)
        }}
        onConfirm={() => void handleDeactivate()}
      >
        {mutations.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {mutations.error}
          </div>
        ) : null}
      </ConfirmModal>
    </div>
  )
}
