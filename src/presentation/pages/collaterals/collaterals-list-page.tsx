import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import {
  TableTabular,
  type TableTabularColumn,
} from '@/presentation/share/components/table-tabular'
import { useCollateralCatalogsCache } from '@/presentation/features/collaterals/hooks/use-collateral-catalogs-cache'
import { useCollateralsList } from '@/presentation/features/collaterals/hooks/use-collaterals-list'
import { useCollateralClientSearch } from '@/presentation/features/collaterals/hooks/use-collateral-client-search'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'

const PAGE_SIZE_OPTIONS = [20, 50, 100]
const PERSONAL_GUARANTOR_TYPE_CODE = 'PERSONAL_GUARANTOR'

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

const isPersonalGuarantorType = (typeCode?: string | null) =>
  (typeCode ?? '').trim().toUpperCase() === PERSONAL_GUARANTOR_TYPE_CODE

export const CollateralsListPage = () => {
  const navigate = useNavigate()
  const {
    hasPermission,
    isLoading: isLoadingPermissions,
  } = useUserPermissions()
  const canReadCollaterals = hasPermission('collaterals.read')
  const canCreateCollaterals = hasPermission('collaterals.create')
  const canUpdateCollaterals = hasPermission('collaterals.update')
  const canReadCatalogs = hasPermission('collaterals.catalogs.read')
  const { types, statuses, isLoading: isLoadingCatalogs } =
    useCollateralCatalogsCache({ enabled: canReadCatalogs })
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
  } = useCollateralsList({ enabled: canReadCollaterals })

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
  const showGuarantorColumns = useMemo(
    () => items.some((item) => isPersonalGuarantorType(item.collateralTypeCode)),
    [items],
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

  const columns: TableTabularColumn<CollateralResponseDto>[] = [
    {
      key: 'reference',
      header: 'Referencia',
      className: 'min-w-[130px]',
      render: (item) => (
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {item.referenceNo || '—'}
        </span>
      ),
      getTitle: (item) => item.referenceNo || '—',
    },
    {
      key: 'type',
      header: 'Tipo',
      className: 'min-w-[150px]',
      render: (item) => item.collateralTypeName ?? selectedType?.name ?? '—',
      getTitle: (item) =>
        item.collateralTypeName ?? selectedType?.name ?? '—',
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'min-w-[130px]',
      render: (item) => item.statusName ?? selectedStatus?.name ?? '—',
      getTitle: (item) => item.statusName ?? selectedStatus?.name ?? '—',
    },
    {
      key: 'owner',
      header: 'Propietario',
      className: 'min-w-[200px]',
      render: (item) =>
        item.ownerClientName ?? item.ownerClientFullName ?? '—',
      getTitle: (item) =>
        item.ownerClientName ?? item.ownerClientFullName ?? '—',
    },
    {
      key: 'identity',
      header: 'Identidad',
      className: 'min-w-[135px]',
      render: (item) => (
        <HnIdentityText
          value={item.ownerIdentity ?? item.ownerClientIdentityNo}
        />
      ),
    },
    ...(showGuarantorColumns
      ? [
          {
            key: 'guarantor',
            header: 'Cliente Aval',
            className: 'min-w-[200px]',
            render: (item: CollateralResponseDto) =>
              isPersonalGuarantorType(item.collateralTypeCode)
                ? item.guarantorClientFullName || '—'
                : '—',
            getTitle: (item: CollateralResponseDto) =>
              isPersonalGuarantorType(item.collateralTypeCode)
                ? item.guarantorClientFullName || '—'
                : '—',
          },
          {
            key: 'guarantorIdentity',
            header: 'Identidad Aval',
            className: 'min-w-[135px]',
            render: (item: CollateralResponseDto) =>
              isPersonalGuarantorType(item.collateralTypeCode) ? (
                <HnIdentityText value={item.guarantorClientIdentityNo} />
              ) : (
                '—'
              ),
          },
        ]
      : []),
    {
      key: 'appraisedValue',
      header: 'Valor Avalúo',
      className: 'min-w-[120px] text-right',
      render: (item) => formatMoney(item.appraisedValue),
      getTitle: (item) => formatMoney(item.appraisedValue),
    },
    {
      key: 'appraisedDate',
      header: 'Fecha Avalúo',
      className: 'min-w-[115px]',
      render: (item) => formatDate(item.appraisedDate),
      getTitle: (item) => formatDate(item.appraisedDate),
    },
    {
      key: 'active',
      header: 'Activa',
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            item.isActive
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {item.isActive ? 'Activa' : 'Inactiva'}
        </span>
      ),
      getTitle: (item) => (item.isActive ? 'Activa' : 'Inactiva'),
    },
    {
      key: 'created',
      header: 'Creada',
      className: 'min-w-[100px]',
      render: (item) => formatDate(item.createdAt),
      getTitle: (item) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[120px]',
      render: (item) => (
        <span className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="btn-table-action"
            onClick={() => navigate(`/clients/collaterals/${item.id}`)}
          >
            Ver
          </button>
          {canUpdateCollaterals ? (
            <button
              type="button"
              className="btn-table-action"
              onClick={() => navigate(`/clients/collaterals/${item.id}/edit`)}
            >
              Editar
            </button>
          ) : null}
        </span>
      ),
    },
  ]

  if (isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando permisos...
      </div>
    )
  }

  if (!canReadCollaterals) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para consultar garantías.
        </p>
      </div>
    )
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
        {canCreateCollaterals ? (
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => navigate('/clients/collaterals/new')}
          >
            Nueva Garantía
          </button>
        ) : null}
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
                disabled={!canReadCatalogs || isLoadingCatalogs}
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
                disabled={!canReadCatalogs || isLoadingCatalogs}
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

      <div className="space-y-3">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <TableTabular
          title="Listado de garantías"
          columns={columns}
          rows={items}
          rowKey={(item) => item.id}
          isLoading={isLoading}
          loadingMessage="Cargando garantías..."
          emptyMessage={error ? 'No fue posible cargar las garantías.' : 'No hay garantías con los filtros actuales.'}
          maxHeightClassName="max-h-[640px]"
          rowNumberStart={(page - 1) * pageSize + 1}
        />

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          label="Página"
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={(next) => {
            setPageSize(next)
            setPage(1)
          }}
          pageSizeLabel="Tamaño de página"
        />
      </div>
    </div>
  )
}
