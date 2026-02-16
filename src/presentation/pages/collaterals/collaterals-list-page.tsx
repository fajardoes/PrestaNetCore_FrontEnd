import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableContainer } from '@/presentation/share/components/table-container'
import { useCollateralCatalogsCache } from '@/presentation/features/collaterals/hooks/use-collateral-catalogs-cache'
import { useCollateralsList } from '@/presentation/features/collaterals/hooks/use-collaterals-list'
import { useCollateralClientSearch } from '@/presentation/features/collaterals/hooks/use-collateral-client-search'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const CollateralsListPage = () => {
  const navigate = useNavigate()
  const { types, statuses, isLoading: isLoadingCatalogs } =
    useCollateralCatalogsCache()
  const { searchClients } = useCollateralClientSearch()
  const {
    items,
    isLoading,
    error,
    filters,
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
    applyFilters,
  } = useCollateralsList()

  const [search, setSearch] = useState(filters.search ?? '')
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>(
    filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive',
  )
  const [ownerClientId, setOwnerClientId] = useState(filters.ownerClientId ?? '')
  const [typeId, setTypeId] = useState(filters.typeId ?? '')
  const [statusId, setStatusId] = useState(filters.statusId ?? '')
  const [selectedClient, setSelectedClient] = useState<
    AsyncSelectOption<ClientListItem> | null
  >(null)

  const selectedType = useMemo(
    () => types.find((item) => item.id === typeId),
    [typeId, types],
  )
  const selectedStatus = useMemo(
    () => statuses.find((item) => item.id === statusId),
    [statusId, statuses],
  )

  const applyCurrentFilters = () => {
    applyFilters({
      ownerClientId: ownerClientId || undefined,
      typeId: typeId || undefined,
      statusId: statusId || undefined,
      active:
        statusFilter === 'all' ? undefined : statusFilter === 'active' ? true : false,
      search: search.trim() || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Garantías
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Administra garantías reutilizables por cliente y su estado operativo.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary px-4 py-2 text-sm"
          onClick={() => navigate('/clients/collaterals/new')}
        >
          Nueva Garantía
        </button>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <ListFiltersBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar por referencia, descripción o propietario..."
          status={statusFilter}
          onStatusChange={setStatusFilter}
          layout="two-rows"
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => {
                  setSearch('')
                  setStatusFilter('active')
                  setOwnerClientId('')
                  setTypeId('')
                  setStatusId('')
                  setSelectedClient(null)
                  applyFilters({ active: true })
                }}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="btn-primary rounded-md px-2.5 py-1.5 text-xs font-medium"
                onClick={applyCurrentFilters}
              >
                Buscar
              </button>
            </div>
          }
        >
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cliente
              </label>
              <AsyncSelect<ClientListItem>
                value={selectedClient}
                onChange={(option) => {
                  setSelectedClient(option)
                  setOwnerClientId(option?.value ?? '')
                }}
                loadOptions={searchClients}
                placeholder="Buscar cliente..."
                noOptionsMessage="Sin resultados"
                isDisabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tipo
              </label>
              <select
                value={typeId}
                onChange={(event) => setTypeId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={isLoadingCatalogs}
              >
                <option value="">Todos los tipos</option>
                {types.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estado
              </label>
              <select
                value={statusId}
                onChange={(event) => setStatusId(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={isLoadingCatalogs}
              >
                <option value="">Todos los estados</option>
                {statuses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ListFiltersBar>
      </div>

      <TableContainer mode="legacy-compact">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Referencia
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Propietario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Identidad
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Valor Avalúo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Fecha Avalúo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Activa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Creada
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Cargando garantías...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300">
                    {error}
                  </td>
                </tr>
              ) : !items.length ? (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    No hay garantías con los filtros actuales.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100">
                      {item.referenceNo || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.collateralTypeName ?? selectedType?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.statusName ?? selectedStatus?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.ownerClientName ?? item.ownerClientFullName ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      <HnIdentityText
                        value={item.ownerIdentity ?? item.ownerClientIdentityNo}
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-700 dark:text-slate-300">
                      {formatMoney(item.appraisedValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(item.appraisedDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                            : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                        }`}
                      >
                        {item.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => navigate(`/clients/collaterals/${item.id}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => navigate(`/clients/collaterals/${item.id}/edit`)}
                        >
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>Tamaño de página</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const next = Number(event.target.value)
                setPageSize(next)
                setPage(1)
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} label="Página" />
        </div>
      </TableContainer>
    </div>
  )
}
