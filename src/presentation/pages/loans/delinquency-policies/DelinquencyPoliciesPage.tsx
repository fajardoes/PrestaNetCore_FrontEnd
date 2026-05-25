import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountingStatusBadge } from '@/presentation/features/accounting/components/accounting-status-badge'
import { ListFiltersBar, type StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useDelinquencyPoliciesList } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policies-list'
import { useDelinquencyPolicyMutations } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-mutations'
import type { DelinquencyPolicyListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-list-item.response'

export const DelinquencyPoliciesPage = () => {
  const navigate = useNavigate()
  const { filters, setFilters, load, items, isLoading, error } =
    useDelinquencyPoliciesList()
  const {
    toggleStatus,
    isSaving: isToggling,
    error: mutationError,
    clearError,
  } = useDelinquencyPolicyMutations()
  const [pendingToggle, setPendingToggle] =
    useState<DelinquencyPolicyListItemDto | null>(null)

  const statusValue: StatusFilterValue = useMemo(() => {
    if (filters.isActive === true) return 'active'
    if (filters.isActive === false) return 'inactive'
    return 'all'
  }, [filters.isActive])

  const handleStatusChange = (value: StatusFilterValue) => {
    setFilters((prev) => ({
      ...prev,
      isActive: value === 'all' ? undefined : value === 'active',
    }))
  }

  const handleSearch = () => {
    clearError()
    void load(filters)
  }

  const handleToggleConfirm = async () => {
    if (!pendingToggle) return
    const nextStatus = !pendingToggle.isActive
    const result = await toggleStatus(pendingToggle.id, nextStatus)
    if (result.success) {
      setPendingToggle(null)
      await load(filters)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Políticas de Mora
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra reglas, parámetros y buckets de cálculo para mora.
        </p>
      </div>

      {mutationError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
          {mutationError}
        </div>
      ) : null}

      <ListFiltersBar
        search={filters.search ?? ''}
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, search: value }))
        }
        placeholder="Buscar por código o nombre..."
        status={statusValue}
        onStatusChange={handleStatusChange}
        actions={
          <>
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={handleSearch}
            >
              Buscar
            </button>
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              onClick={() => navigate('/loans/delinquency-policies/new')}
            >
              Nueva política
            </button>
          </>
        }
      />

      <TableContainer mode="legacy-compact">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Código
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Activa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Días gracia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tasa anual
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Base
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                    colSpan={7}
                  >
                    Cargando políticas...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                    colSpan={7}
                  >
                    {error}
                  </td>
                </tr>
              ) : !items.length ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                    colSpan={7}
                  >
                    No hay políticas con esos filtros.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <AccountingStatusBadge isActive={item.isActive} />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.graceDays}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.penaltyRateAnnual}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.rateBase}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() =>
                            navigate(`/loans/delinquency-policies/${item.id}`)
                          }
                        >
                          Ver/Editar
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setPendingToggle(item)}
                          disabled={isToggling}
                        >
                          {item.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>

      <ConfirmModal
        open={Boolean(pendingToggle)}
        title={
          pendingToggle?.isActive
            ? 'Desactivar política'
            : 'Activar política'
        }
        description={
          pendingToggle?.isActive
            ? '¿Deseas desactivar esta política?'
            : '¿Deseas activar esta política?'
        }
        confirmLabel={pendingToggle?.isActive ? 'Desactivar' : 'Activar'}
        onCancel={() => setPendingToggle(null)}
        onConfirm={handleToggleConfirm}
        isProcessing={isToggling}
      />
    </div>
  )
}
