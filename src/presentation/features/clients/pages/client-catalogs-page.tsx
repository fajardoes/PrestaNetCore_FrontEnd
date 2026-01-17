import { useCallback, useMemo, useRef, useState } from 'react'
import { createClientCatalogAction, updateClientCatalogAction } from '@/core/actions/clients/save-client-catalog.action'
import { toggleClientCatalogAction } from '@/core/actions/clients/toggle-client-catalog.action'
import { deleteClientCatalogAction } from '@/core/actions/clients/delete-client-catalog.action'
import { createEconomicActivityAction, updateEconomicActivityAction } from '@/core/actions/clients/save-economic-activity.action'
import { toggleEconomicActivityAction } from '@/core/actions/clients/toggle-economic-activity.action'
import { deleteEconomicActivityAction } from '@/core/actions/clients/delete-economic-activity.action'
import { listClientCatalogsAction } from '@/core/actions/clients/list-client-catalogs.action'
import type {
  ClientCatalogItem,
  EconomicActivityCatalog,
} from '@/infrastructure/interfaces/clients/catalog'
import type { ClientCatalogFormValues } from '@/infrastructure/validations/clients/catalog.schema'
import type { EconomicActivityFormValues } from '@/infrastructure/validations/clients/economic-activity.schema'
import { useClientCatalogList } from '@/presentation/features/clients/hooks/use-client-catalog-list'
import { useEconomicActivityList } from '@/presentation/features/clients/hooks/use-economic-activity-list'
import { useClientLookups } from '@/presentation/features/clients/hooks/use-client-lookups'
import { CatalogTable } from '@/presentation/features/clients/components/catalog-table'
import { ClientCatalogModal } from '@/presentation/features/clients/components/client-catalog-modal'
import { EconomicActivitiesTable } from '@/presentation/features/clients/components/economic-activities-table'
import { EconomicActivityModal } from '@/presentation/features/clients/components/economic-activity-modal'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const catalogGroups = [
  { slug: 'clientes-sector', label: 'Sectores' },
  { slug: 'clientes-civil-status', label: 'Estado civil' },
  { slug: 'clientes-gender', label: 'Géneros' },
  { slug: 'clientes-profession', label: 'Profesiones' },
  { slug: 'clientes-dependents', label: 'Dependientes' },
  { slug: 'clientes-housing-type', label: 'Tipo de vivienda' }
]

const statusToOnlyActive = (status: StatusFilterValue) => {
  if (status === 'all') return undefined
  return status === 'active'
}

export const ClientCatalogsPage = () => {
  const [group, setGroup] = useState(catalogGroups[0]?.slug ?? '')
  const [section, setSection] = useState<'catalogs' | 'activities'>(
    'catalogs',
  )
  const [search, setSearch] = useState('')
  const [catalogStatus, setCatalogStatus] = useState<StatusFilterValue>('active')
  const [editingCatalog, setEditingCatalog] = useState<ClientCatalogItem | null>(
    null,
  )
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [isSavingCatalog, setIsSavingCatalog] = useState(false)
  const [parentIds, setParentIds] = useState<Record<string, string>>({})

  const [sectorFilter, setSectorFilter] = useState<string | undefined>(undefined)
  const [activitySearch, setActivitySearch] = useState('')
  const [activityStatus, setActivityStatus] =
    useState<StatusFilterValue>('active')
  const [editingActivity, setEditingActivity] =
    useState<EconomicActivityCatalog | null>(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [isSavingActivity, setIsSavingActivity] = useState(false)
  const activitySectionRef = useRef<HTMLDivElement | null>(null)

  const { sectors, error: lookupError } = useClientLookups()

  const {
    catalogs,
    error: catalogListError,
    isLoading: isLoadingCatalogs,
    page: catalogPage,
    totalPages: catalogTotalPages,
    setPage: setCatalogPage,
    refresh: refreshCatalogs,
  } = useClientCatalogList({
    parentSlug: group,
    search,
    onlyActive: statusToOnlyActive(catalogStatus),
  })

  const {
    activities,
    error: activityListError,
    isLoading: isLoadingActivities,
    page: activityPage,
    totalPages: activityTotalPages,
    setPage: setActivityPage,
    refresh: refreshActivities,
  } = useEconomicActivityList({
    sectorId: sectorFilter,
    search: activitySearch,
    onlyActive: statusToOnlyActive(activityStatus),
  })

  const catalogHeaderError = catalogListError ?? lookupError

  const selectedGroupLabel = useMemo(
    () => catalogGroups.find((item) => item.slug === group)?.label ?? '',
    [group],
  )

  const resolveParentId = useCallback(async (): Promise<string | null> => {
    if (parentIds[group]) {
      return parentIds[group]
    }

    const existingParentId =
      catalogs.find((item) => item.parentId)?.parentId ?? null
    if (existingParentId) {
      setParentIds((prev) => ({ ...prev, [group]: existingParentId }))
      return existingParentId
    }

    const parents = await listClientCatalogsAction({
      pageNumber: 1,
      pageSize: 200,
      onlyActive: true,
    })

    if (!parents.success) {
      setCatalogError(parents.error)
      return null
    }

    const parent = parents.data.items.find((item) => item.slug === group)
    if (!parent) {
      setCatalogError('No se encontró el catálogo padre para este grupo.')
      return null
    }

    setParentIds((prev) => ({ ...prev, [group]: parent.id }))
    return parent.id
  }, [catalogs, group, parentIds])

  const handleSaveCatalog = async (values: ClientCatalogFormValues) => {
    setIsSavingCatalog(true)
    setCatalogError(null)
    const parentId = await resolveParentId()
    if (!parentId) {
      setIsSavingCatalog(false)
      return
    }
    const payload = { ...values, parentId, parentSlug: group }
    const result = editingCatalog
      ? await updateClientCatalogAction(editingCatalog.id, payload)
      : await createClientCatalogAction(payload)

    if (result.success) {
      setEditingCatalog(null)
      setIsCatalogModalOpen(false)
      await refreshCatalogs(1)
    } else {
      setCatalogError(result.error)
    }
    setIsSavingCatalog(false)
  }

  const handleToggleCatalog = async (catalog: ClientCatalogItem) => {
    const result = await toggleClientCatalogAction(catalog.id, !catalog.activo)
    if (result.success) {
      await refreshCatalogs(catalogPage)
    } else {
      setCatalogError(result.error)
    }
  }

  const handleDeleteCatalog = async (catalog: ClientCatalogItem) => {
    if (
      !window.confirm(
        '¿Seguro que deseas eliminar este catálogo? Se ocultará de los combos.',
      )
    ) {
      return
    }
    const result = await deleteClientCatalogAction(catalog.id)
    if (result.success) {
      await refreshCatalogs(catalogPage)
    } else {
      setCatalogError(result.error)
    }
  }

  const handleSaveActivity = async (values: EconomicActivityFormValues) => {
    setIsSavingActivity(true)
    setActivityError(null)
    const result = editingActivity
      ? await updateEconomicActivityAction(editingActivity.id, values)
      : await createEconomicActivityAction(values)
    if (result.success) {
      setEditingActivity(null)
      setIsActivityModalOpen(false)
      await refreshActivities(1)
    } else {
      setActivityError(result.error)
    }
    setIsSavingActivity(false)
  }

  const handleToggleActivity = async (activity: EconomicActivityCatalog) => {
    const result = await toggleEconomicActivityAction(
      activity.id,
      !activity.activo,
    )
    if (result.success) {
      await refreshActivities(activityPage)
    } else {
      setActivityError(result.error)
    }
  }

  const handleDeleteActivity = async (activity: EconomicActivityCatalog) => {
    if (
      !window.confirm(
        '¿Eliminar la actividad económica? Esta acción la quitará de las opciones.',
      )
    ) {
      return
    }
    const result = await deleteEconomicActivityAction(activity.id)
    if (result.success) {
      await refreshActivities(activityPage)
    } else {
      setActivityError(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Catálogos de clientes
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra sectores, catálogos base y actividades económicas filtradas por sector.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {catalogGroups.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => {
                setGroup(item.slug)
                setSection('catalogs')
              }}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                section === 'catalogs' && group === item.slug
                  ? 'border-primary bg-primary text-white shadow'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-primary/60 hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setSection('activities')
              activitySectionRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              })
            }}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              section === 'activities'
                ? 'border-primary bg-primary text-white shadow'
                : 'border-slate-300 bg-white text-slate-700 hover:border-primary/60 hover:text-primary dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            }`}
          >
            Actividades económicas por sector
          </button>
        </div>

        {section === 'catalogs' ? (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <ListFiltersBar
              search={search}
              onSearchChange={(value) => {
                setSearch(value)
                setCatalogPage(1)
              }}
              placeholder={`Buscar en ${selectedGroupLabel.toLowerCase()}...`}
              status={catalogStatus}
              onStatusChange={(value) => {
                setCatalogStatus(value)
                setCatalogPage(1)
              }}
              actions={
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    setEditingCatalog(null)
                    setIsCatalogModalOpen(true)
                  }}
                >
                  Nuevo {selectedGroupLabel.toLowerCase()}
                </button>
              }
            />

            <CatalogTable
              items={catalogs}
              isLoading={isLoadingCatalogs}
              error={catalogHeaderError}
              onEdit={(catalog) => {
                setEditingCatalog(catalog)
                setIsCatalogModalOpen(true)
              }}
              onToggle={handleToggleCatalog}
              onDelete={handleDeleteCatalog}
              page={catalogPage}
              totalPages={catalogTotalPages}
              onPageChange={(next) =>
                setCatalogPage(Math.min(Math.max(1, next), catalogTotalPages))
              }
            />
          </div>
        ) : null}
      </div>

      {section === 'activities' ? (
        <div
          ref={activitySectionRef}
          className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Actividades económicas por sector
              </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Usa el filtro por sector y activa/desactiva sin recargar toda la página.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              setEditingActivity(null)
              setIsActivityModalOpen(true)
            }}
          >
            Nueva actividad
          </button>
        </div>

        <ListFiltersBar
          search={activitySearch}
          onSearchChange={(value) => {
            setActivitySearch(value)
            setActivityPage(1)
          }}
          placeholder="Buscar actividad..."
          status={activityStatus}
          onStatusChange={(value) => {
            setActivityStatus(value)
            setActivityPage(1)
          }}
          children={
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 md:w-64"
              value={sectorFilter ?? ''}
              onChange={(event) => {
                setSectorFilter(event.target.value || undefined)
                setActivityPage(1)
              }}
            >
              <option value="">Todos los sectores</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.nombre}
                </option>
              ))}
            </select>
          }
        />

        <EconomicActivitiesTable
          items={activities}
          isLoading={isLoadingActivities}
          error={activityListError}
          onEdit={(activity) => {
            setEditingActivity(activity)
            setIsActivityModalOpen(true)
          }}
          onToggle={handleToggleActivity}
          onDelete={handleDeleteActivity}
          page={activityPage}
          totalPages={activityTotalPages}
          onPageChange={(next) =>
            setActivityPage(Math.min(Math.max(1, next), activityTotalPages))
          }
        />
        </div>
      ) : null}

      <ClientCatalogModal
        open={isCatalogModalOpen}
        onClose={() => {
          setIsCatalogModalOpen(false)
          setEditingCatalog(null)
          setCatalogError(null)
        }}
        onSubmit={handleSaveCatalog}
        isSaving={isSavingCatalog}
        error={catalogError}
        catalog={editingCatalog}
        title={selectedGroupLabel}
      />

      <EconomicActivityModal
        open={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false)
          setEditingActivity(null)
          setActivityError(null)
        }}
        onSubmit={handleSaveActivity}
        isSaving={isSavingActivity}
        error={activityError}
        activity={editingActivity}
        sectors={sectors}
      />
    </div>
  )
}
