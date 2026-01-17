import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useCostCenters } from '@/presentation/features/accounting/hooks/use-cost-centers'
import { useCostCenterForm } from '@/presentation/features/accounting/hooks/use-cost-center-form'
import { useSyncCostCenters } from '@/presentation/features/accounting/hooks/use-sync-cost-centers'
import { CostCentersTable } from '@/presentation/features/accounting/components/cost-centers-table'
import { CostCenterFormModal } from '@/presentation/features/accounting/components/cost-center-form-modal'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

export const CostCentersPage = () => {
  const { user } = useAuth()
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false

  const {
    costCenters,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useCostCenters({ enabled: isAdmin })

  const { agencies, isLoading: agenciesLoading } = useAgencies({
    enabled: isAdmin,
  })
  const syncState = useSyncCostCenters()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    form,
    onSubmit,
    isSaving,
    error: formError,
    setError: setFormError,
  } = useCostCenterForm({
    onCompleted: async () => {
      setIsModalOpen(false)
      await refresh()
    },
  })

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar centros de costo.
        </p>
      </div>
    )
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: StatusFilterValue) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleSync = async () => {
    const result = await syncState.sync()
    if (result.success) {
      await refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Centros de costo
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Sincroniza con agencias y administra los centros disponibles.
        </p>
      </div>

      <ListFiltersBar
        search={search}
        onSearchChange={handleSearchChange}
        placeholder="Buscar por nombre, código o slug..."
        status={statusFilter}
        onStatusChange={handleStatusChange}
        actions={
          <>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={handleSync}
              disabled={syncState.isLoading}
            >
              {syncState.isLoading ? 'Sincronizando...' : 'Sync con agencias'}
            </button>
            <button
            type="button"
            className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              setFormError(null)
              form.reset({
                code: '',
                name: '',
                slug: '',
                agencyId: '',
                isActive: true,
              })
              setIsModalOpen(true)
            }}
          >
            Nuevo centro
          </button>
          </>
        }
      />

      {syncState.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {syncState.error}
        </div>
      ) : null}

      <CostCentersTable
        costCenters={costCenters}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

      <CostCenterFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormError(null)
          form.reset({
            code: '',
            name: '',
            slug: '',
            agencyId: '',
            isActive: true,
          })
        }}
        form={form}
        onSubmit={onSubmit}
        isSaving={isSaving}
        error={formError}
        agencies={agenciesLoading ? [] : agencies}
      />
    </div>
  )
}
