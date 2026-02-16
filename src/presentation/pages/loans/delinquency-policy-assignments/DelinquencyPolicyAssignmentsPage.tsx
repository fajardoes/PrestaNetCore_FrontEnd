import { useMemo, useState } from 'react'
import { AccountingStatusBadge } from '@/presentation/features/accounting/components/accounting-status-badge'
import { ListFiltersBar, type StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { DelinquencyPolicyAssignmentModal } from '@/presentation/components/loans/delinquency/DelinquencyPolicyAssignmentModal'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import { useDelinquencyPolicyAssignmentsList } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-assignments-list'
import { useDelinquencyPolicyAssignmentMutations } from '@/presentation/features/loans/delinquency/hooks/use-delinquency-policy-assignment-mutations'
import { useActiveDelinquencyPolicies } from '@/presentation/features/loans/delinquency/hooks/use-active-delinquency-policies'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useLoanCatalogsCache } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalogs-cache'
import { TableContainer } from '@/presentation/share/components/table-container'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'
import type { DelinquencyPolicyAssignmentFormValues } from '@/infrastructure/validations/loans/delinquency-policy-assignment.schema'

const filterOptions = <TMeta,>(
  options: AsyncSelectOption<TMeta>[],
  inputValue: string,
) => {
  const term = inputValue.trim().toLowerCase()
  if (!term) return options
  return options.filter((option) => option.label.toLowerCase().includes(term))
}

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

  const agencyOptions = useMemo(
    () =>
      agencies.map((agency) => ({
        value: agency.id,
        label: `${agency.code} - ${agency.name}`,
        meta: agency,
      })),
    [agencies],
  )
  const portfolioTypeOptions = useMemo(
    () =>
      catalogs.portfolioTypes.map((type) => ({
        value: type.id,
        label: `${type.code} - ${type.name}`,
        meta: type,
      })),
    [catalogs.portfolioTypes],
  )

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
          <div className="w-full sm:w-56">
            <AsyncSelect
              value={
                agencyOptions.find((option) => option.value === (filters.agencyId ?? '')) ??
                null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  agencyId: option?.value || undefined,
                }))
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(agencyOptions, inputValue))
              }
              placeholder="Todas las sucursales"
              instanceId="delinquency-policy-assignments-agency-filter"
              defaultOptions={agencyOptions}
              isClearable
              noOptionsMessage="Sin sucursales"
            />
          </div>

          <div className="w-full sm:w-56">
            <AsyncSelect
              value={
                portfolioTypeOptions.find(
                  (option) => option.value === (filters.portfolioTypeId ?? ''),
                ) ?? null
              }
              onChange={(option) =>
                setFilters((prev) => ({
                  ...prev,
                  portfolioTypeId: option?.value || undefined,
                }))
              }
              loadOptions={(inputValue) =>
                Promise.resolve(filterOptions(portfolioTypeOptions, inputValue))
              }
              placeholder="Todos los tipos"
              instanceId="delinquency-policy-assignments-portfolio-type-filter"
              defaultOptions={portfolioTypeOptions}
              isClearable
              noOptionsMessage="Sin tipos de cartera"
            />
          </div>
        </div>
      </ListFiltersBar>

      <TableContainer mode="legacy-compact">
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
                          className="btn-table-action"
                          onClick={() => {
                            setEditingAssignment(item)
                            setIsModalOpen(true)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
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
      </TableContainer>

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
