import { useMemo, useState } from 'react'
import { Eye, Pencil, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { useLoanApplicationsList } from '@/presentation/features/loans/applications/hooks/use-loan-applications-list'
import { useLoanApplicationOptions } from '@/presentation/features/loans/applications/hooks/use-loan-application-options'
import {
  formatDate,
  formatMoney,
  statusBadgeClass,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

export const LoanApplicationsListPage = () => {
  const navigate = useNavigate()
  const {
    items,
    isLoading,
    error,
    filters,
    page,
    take,
    totalPages,
    statusOptions,
    applyFilters,
    setPage,
    setTake,
  } = useLoanApplicationsList()
  const {
    searchClients,
    searchPromoters,
    searchLoanProducts,
  } = useLoanApplicationOptions()

  const [search, setSearch] = useState(filters.search ?? '')
  const [clientId, setClientId] = useState(filters.clientId ?? '')
  const [loanProductId, setLoanProductId] = useState(filters.loanProductId ?? '')
  const [promoterId, setPromoterId] = useState(filters.promoterId ?? '')
  const [statusId, setStatusId] = useState(filters.statusId ?? '')
  const [createdFrom, setCreatedFrom] = useState(filters.createdFrom ?? '')
  const [createdTo, setCreatedTo] = useState(filters.createdTo ?? '')

  const [selectedClient, setSelectedClient] = useState<AsyncSelectOption | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<AsyncSelectOption | null>(null)
  const [selectedPromoter, setSelectedPromoter] = useState<AsyncSelectOption | null>(null)

  const statusOptionsResolved = useMemo(() => {
    if (!statusId) return statusOptions
    const exists = statusOptions.some((item) => item.value === statusId)
    if (exists) return statusOptions
    return [...statusOptions, { value: statusId, label: statusId }]
  }, [statusId, statusOptions])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Solicitudes de crédito
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gestiona solicitudes, flujo de aprobación y garantías vinculadas.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <ListFiltersBar
          search={search}
          onSearchChange={setSearch}
          status="all"
          onStatusChange={() => undefined}
          showStatus={false}
          layout="two-rows"
          placeholder="Buscar por número, cliente o producto..."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => {
                  setSearch('')
                  setClientId('')
                  setLoanProductId('')
                  setPromoterId('')
                  setStatusId('')
                  setCreatedFrom('')
                  setCreatedTo('')
                  setSelectedClient(null)
                  setSelectedProduct(null)
                  setSelectedPromoter(null)
                  applyFilters({})
                }}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="btn-primary px-3 py-1.5 text-xs"
                onClick={() => {
                  applyFilters({
                    search,
                    clientId: clientId || undefined,
                    loanProductId: loanProductId || undefined,
                    promoterId: promoterId || undefined,
                    statusId: statusId || undefined,
                    createdFrom: createdFrom || undefined,
                    createdTo: createdTo || undefined,
                  })
                }}
              >
                Buscar
              </button>
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-xs"
                onClick={() => navigate('/loans/applications/new')}
              >
                <Plus className="h-3.5 w-3.5" /> Crear solicitud
              </button>
            </div>
          }
        >
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cliente
              </label>
              <AsyncSelect
                value={selectedClient}
                onChange={(option) => {
                  setSelectedClient(option)
                  setClientId(option?.value ?? '')
                }}
                loadOptions={searchClients}
                placeholder="Cliente"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Producto
              </label>
              <AsyncSelect
                value={selectedProduct}
                onChange={(option) => {
                  setSelectedProduct(option)
                  setLoanProductId(option?.value ?? '')
                }}
                loadOptions={searchLoanProducts}
                placeholder="Producto"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Promotor
              </label>
              <AsyncSelect
                value={selectedPromoter}
                onChange={(option) => {
                  setSelectedPromoter(option)
                  setPromoterId(option?.value ?? '')
                }}
                loadOptions={searchPromoters}
                placeholder="Promotor"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Estado
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={statusId}
                onChange={(event) => setStatusId(event.target.value)}
              >
                <option value="">Todos</option>
                {statusOptionsResolved.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Desde
              </label>
              <DatePicker value={createdFrom} onChange={setCreatedFrom} allowFutureDates />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Hasta
              </label>
              <DatePicker value={createdTo} onChange={setCreatedTo} allowFutureDates />
            </div>
          </div>
        </ListFiltersBar>
      </div>

      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Promotor</th>
                <th className="text-right">Principal</th>
                <th className="text-right">Plazo</th>
                <th>Estado</th>
                <th>Creación</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                    Cargando solicitudes...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={9} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                    {error}
                  </td>
                </tr>
              ) : !items.length ? (
                <tr>
                  <td colSpan={9} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                    No hay solicitudes para los filtros actuales.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.applicationNo || item.id.slice(0, 8)}</td>
                    <td>
                      <div>
                        <p>{item.clientFullName}</p>
                        <HnIdentityText value={item.clientIdentityNo} className="text-[11px] text-slate-500" />
                      </div>
                    </td>
                    <td>{item.loanProductName}</td>
                    <td>{item.promoterClientFullName}</td>
                    <td className="text-right">{formatMoney(item.requestedPrincipal)}</td>
                    <td className="text-right">{item.requestedTerm}</td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(item.statusCode)}`}
                      >
                        {item.statusName}
                      </span>
                    </td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="btn-table-action w-7 px-0"
                          onClick={() => navigate(`/loans/applications/${item.id}`)}
                          title="Ver detalle de solicitud"
                          aria-label="Ver"
                        >
                          <Eye className="mx-auto h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="btn-table-action w-7 px-0"
                          onClick={() =>
                            navigate(`/loans/applications/${item.id}/edit`, {
                              state: { returnTo: '/loans/applications' },
                            })
                          }
                          disabled={item.statusCode !== 'DRAFT'}
                          title={
                            item.statusCode === 'DRAFT'
                              ? 'Editar solicitud'
                              : 'Solo editable en estado borrador'
                          }
                          aria-label="Editar"
                        >
                          <Pencil className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={take}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={setTake}
        />
      </TableContainer>
    </div>
  )
}
