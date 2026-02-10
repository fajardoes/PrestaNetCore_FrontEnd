import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PromotersTable } from '@/presentation/features/sales/promoters/components/promoters-table'
import { usePromotersExplorer } from '@/presentation/features/sales/promoters/hooks/use-promoters-explorer'
import { useSavePromoter } from '@/presentation/features/sales/promoters/hooks/use-save-promoter'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'

export const PromotersListPage = () => {
  const navigate = useNavigate()
  const {
    promoters,
    isLoading,
    error,
    page,
    totalPages,
    filters,
    setFilters,
    setPage,
    updateActive,
  } = usePromotersExplorer()
  const { toggleStatus, error: actionError, clearError } = useSavePromoter()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleToggle = async (
    promoterId: string,
    agencyId: string,
    nextState: boolean,
  ) => {
    setProcessingId(promoterId)
    clearError()
    const result = await toggleStatus(promoterId, agencyId, nextState)
    if (result.success) {
      updateActive(promoterId, nextState)
    }
    setProcessingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Creditos - Promotores
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra los promotores disponibles para el equipo comercial.
        </p>
      </div>

      <ListFiltersBar
        search={filters.search}
        onSearchChange={(value) => {
          setFilters((prev) => ({ ...prev, search: value }))
          setPage(1)
        }}
        placeholder="Buscar por nombre, identidad o codigo..."
        status={filters.status}
        onStatusChange={(value) => {
          setFilters((prev) => ({ ...prev, status: value }))
          setPage(1)
        }}
        actions={
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => navigate('/sales/promoters/new')}
          >
            Nuevo promotor
          </button>
        }
      />

      {actionError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {actionError}
        </div>
      ) : null}

      <PromotersTable
        promoters={promoters}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={Math.max(1, totalPages)}
        onPageChange={(next) =>
          setPage(Math.min(Math.max(1, next), Math.max(1, totalPages)))
        }
        onEdit={(promoter) => navigate(`/sales/promoters/${promoter.id}`)}
        onToggle={(promoter) =>
          handleToggle(promoter.id, promoter.agencyId, !promoter.isActive)
        }
        processingId={processingId}
      />
    </div>
  )
}
