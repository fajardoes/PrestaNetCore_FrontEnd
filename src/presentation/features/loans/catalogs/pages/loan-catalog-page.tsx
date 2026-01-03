import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useNotifications } from '@/providers/NotificationProvider'
import { LOAN_CATALOG_DEFINITIONS } from '@/core/loans/catalogs/catalog-definitions'
import { useLoanCatalog } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalog'
import { LoanCatalogTable } from '@/presentation/features/loans/catalogs/components/loan-catalog-table'
import { LoanCatalogFormDialog } from '@/presentation/features/loans/catalogs/components/loan-catalog-form-dialog'
import { LoanCatalogFilters } from '@/presentation/features/loans/catalogs/components/loan-catalog-filters'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanCatalogFormValues } from '@/presentation/features/loans/catalogs/components/loan-catalog.schema'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import type { LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'

const statusToQuery = (status: StatusFilterValue) => {
  if (status === 'active') return true
  if (status === 'inactive') return false
  return undefined
}

export const LoanCatalogPage = () => {
  const navigate = useNavigate()
  const { notify } = useNotifications()
  const { catalogKey } = useParams()
  const catalogDefinition = useMemo(
    () =>
      LOAN_CATALOG_DEFINITIONS.find((item) => item.key === catalogKey) ?? null,
    [catalogKey],
  )
  const fallbackKey = LOAN_CATALOG_DEFINITIONS[0]?.key ?? 'term-units'
  const resolvedKey = (catalogDefinition?.key ?? fallbackKey) as LoanCatalogKey
  const isValidCatalog = Boolean(catalogDefinition)

  const {
    items,
    isLoading,
    isSaving,
    error,
    load,
    create,
    update,
    toggleStatus,
    clearError,
  } = useLoanCatalog(resolvedKey)

  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [search, setSearch] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LoanCatalogItemDto | null>(null)
  const [confirmItem, setConfirmItem] = useState<LoanCatalogItemDto | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isValidCatalog) return
    void load({
      search: search.trim() || undefined,
      isActive: statusToQuery(status),
    })
  }, [load, search, status, isValidCatalog])

  if (!isValidCatalog) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
        Catálogo no encontrado.
      </div>
    )
  }

  const handleSubmit = async (values: LoanCatalogFormValues) => {
    clearError()
    if (editingItem) {
      const result = await update(editingItem.id, values)
      if (result.success) {
        setEditingItem(null)
        notify('Catálogo actualizado correctamente.', 'success')
        await load({
          search: search.trim() || undefined,
          isActive: statusToQuery(status),
        })
      }
      return
    }

    const result = await create(values)
    if (result.success) {
      setIsCreateOpen(false)
      notify('Catálogo creado correctamente.', 'success')
      await load({
        search: search.trim() || undefined,
        isActive: statusToQuery(status),
      })
    }
  }

  const handleToggleStatus = async () => {
    if (!confirmItem) return
    setProcessingId(confirmItem.id)
    const result = await toggleStatus(confirmItem.id, !confirmItem.isActive)
    if (result.success) {
      notify('Estado actualizado correctamente.', 'success')
      await load({
        search: search.trim() || undefined,
        isActive: statusToQuery(status),
      })
    }
    setProcessingId(null)
    setConfirmItem(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {catalogDefinition!.title}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {catalogDefinition!.description ??
                'Administra los valores utilizados en productos de préstamo.'}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => {
              navigate('/loans/products/catalogs')
            }}
          >
            Volver a catálogos
          </button>
        </div>
      </div>

      <LoanCatalogFilters
        search={search}
        status={status}
        onSearchChange={(value) => {
          setSearch(value)
        }}
        onStatusChange={setStatus}
        actions={
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              setEditingItem(null)
              setIsCreateOpen(true)
              clearError()
            }}
          >
            Nuevo
          </button>
        }
      />

      <LoanCatalogTable
        items={items}
        isLoading={isLoading}
        error={error}
        isProcessingId={processingId}
        onEdit={(item) => {
          setEditingItem(item)
          setIsCreateOpen(false)
          clearError()
        }}
        onToggleStatus={(item) => setConfirmItem(item)}
      />

      <LoanCatalogFormDialog
        open={isCreateOpen || Boolean(editingItem)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        error={error}
        catalog={editingItem}
      />

      <ConfirmModal
        open={Boolean(confirmItem)}
        title={confirmItem?.isActive ? 'Desactivar registro' : 'Activar registro'}
        description={
          confirmItem?.isActive
            ? `¿Deseas desactivar ${confirmItem?.name}?`
            : `¿Deseas activar ${confirmItem?.name}?`
        }
        confirmLabel={confirmItem?.isActive ? 'Desactivar' : 'Activar'}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmItem(null)}
        isProcessing={isSaving}
      />
    </div>
  )
}
