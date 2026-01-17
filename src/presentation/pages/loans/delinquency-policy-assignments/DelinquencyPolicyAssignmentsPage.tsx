import { useMemo, useState } from 'react'
import { AccountingStatusBadge } from '@/presentation/features/accounting/components/accounting-status-badge'
import { ListFiltersBar, type StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { DelinquencyPolicyAssignmentModal } from '@/presentation/components/loans/delinquency/DelinquencyPolicyAssignmentModal'
import { useDelinquencyPolicyAssignmentsList } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-assignments-list'
import { useDelinquencyPolicyAssignmentMutations } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-assignment-mutations'
import { useActiveDelinquencyPolicies } from '@/presentation/features/loans/delinquency/hooks/use-active-delinquency-policies'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useLoanCatalogsCache } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalogs-cache'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'
import type { DelinquencyPolicyAssignmentFormValues } from '@/infrastructure/validations/loans/delinquency-policy-assignment.schema'

export const DelinquencyPolicyAssignmentsPage = () => {
  const { filters, setFilters, load, items, isLoading, error } =
    useDelinquencyPolicyAssignmentsList()
  const {
    create,
    update,
    toggleStatus,
    isSaving,
    error: mutationError,
    clearError,
  } = useDelinquencyPolicyAssignmentMutations()
  const { items: policies, isLoading: policiesLoading } =
    useActiveDelinquencyPolicies()
  const { agencies } = useAgencies()
  const catalogs = useLoanCatalogsCache()

  const [status, setStatus] = useState<StatusFilterValue>('all')
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] =
    useState<DelinquencyPolicyAssignmentListItemDto | null>(null)
  const [pendingToggle, setPendingToggle] =
    useState<DelinquencyPolicyAssignmentListItemDto | null>(null)

  const handleStatusChange = (value: StatusFilterValue) => {
    setStatus(value)
    setFilters((prev) => ({
      ...prev,
      isActive: value === 'all' ? undefined : value === 'active',
    }))
  }

  const handleSearch = () => {
    clearError()
    void load(filters)
  }

  const handleSubmit = async (values: DelinquencyPolicyAssignmentFormValues) => {
    clearError()
    if (editingAssignment) {
      const result = await update(editingAssignment.id, values)
      if (result.success) {
        setEditingAssignment(null)
        setIsModalOpen(false)
        await load(filters)
      }
      return
    }

    const result = await create(values)
    if (result.success) {
      setIsModalOpen(false)
      await load(filters)
    }
  }

  const handleToggleConfirm = async () => {
    if (!pendingToggle) return
    const result = await toggleStatus(pendingToggle.id, !pendingToggle.isActive)
    if (result.success) {
      setPendingToggle(null)
      await load(filters)
    }
  }

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => {
      return (
        item.policyCode.toLowerCase().includes(term) ||
        item.policyName.toLowerCase().includes(term) ||
        (item.agencyName ?? '').toLowerCase().includes(term) ||
        (item.portfolioTypeName ?? '').toLowerCase().includes(term)
      )
    })
  }, [items, search])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Asignaciones de Políticas
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Define políticas por sucursal y tipo de cartera.
        </p>
      </div>

      {mutationError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
          {mutationError}
        </div>
      ) : null}

      <ListFiltersBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por política o agencia..."
        status={status}
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
              onClick={() => {
                setEditingAssignment(null)
                setIsModalOpen(true)
              }}
            >
              Nueva asignación
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 sm:w-56"
            value={filters.agencyId ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                agencyId: event.target.value || undefined,
              }))
            }
          >
            <option value="">Todas las sucursales</option>
            {agencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.code} - {agency.name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 sm:w-56"
            value={filters.portfolioTypeId ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                portfolioTypeId: event.target.value || undefined,
              }))
            }
          >
            <option value="">Todos los tipos</option>
            {catalogs.portfolioTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.code} - {type.name}
              </option>
            ))}
          </select>
        </div>
      </ListFiltersBar>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Política
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Sucursal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tipo cartera
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Prioridad
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Activa
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
                    colSpan={6}
                  >
                    Cargando asignaciones...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300"
                    colSpan={6}
                  >
                    {error}
                  </td>
                </tr>
              ) : !visibleItems.length ? (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                    colSpan={6}
                  >
                    No hay asignaciones con esos filtros.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.policyCode} - {item.policyName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.agencyName ?? 'Todas'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.portfolioTypeName ?? 'Todas'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.priority}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <AccountingStatusBadge isActive={item.isActive} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          className="btn-icon-label"
                          onClick={() => {
                            setEditingAssignment(item)
                            setIsModalOpen(true)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-icon-label"
                          onClick={() => setPendingToggle(item)}
                          disabled={isSaving}
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
      </div>

      <DelinquencyPolicyAssignmentModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAssignment(null)
        }}
        onSubmit={handleSubmit}
        isSaving={isSaving || policiesLoading || catalogs.isLoading}
        error={mutationError}
        assignment={editingAssignment}
        policies={policies}
        agencies={agencies}
        portfolioTypes={catalogs.portfolioTypes}
      />

      <ConfirmModal
        open={Boolean(pendingToggle)}
        title={
          pendingToggle?.isActive
            ? 'Desactivar asignación'
            : 'Activar asignación'
        }
        description={
          pendingToggle?.isActive
            ? '¿Deseas desactivar esta asignación?'
            : '¿Deseas activar esta asignación?'
        }
        confirmLabel={pendingToggle?.isActive ? 'Desactivar' : 'Activar'}
        onCancel={() => setPendingToggle(null)}
        onConfirm={handleToggleConfirm}
        isProcessing={isSaving}
      />
    </div>
  )
}
