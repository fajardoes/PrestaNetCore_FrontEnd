import { useCallback, useEffect, useMemo, useState } from 'react'
import { listClientCatalogsAction } from '@/core/actions/clients/list-client-catalogs.action'
import { listEconomicActivitiesAction } from '@/core/actions/clients/list-economic-activities.action'
import { listDepartmentsAction } from '@/core/actions/geography/list-departments.action'
import { listMunicipalitiesAction } from '@/core/actions/geography/list-municipalities.action'
import type {
  ClientCatalogItem,
  EconomicActivityCatalog,
} from '@/infrastructure/interfaces/clients/catalog'
import type {
  Department,
  Municipality,
} from '@/infrastructure/interfaces/organization/geography'

const LOOKUP_SLUGS = {
  sectors: 'clientes-sector',
  civilStatus: 'clientes-civil-status',
  genders: 'clientes-gender',
  professions: 'clientes-profession',
  dependents: 'clientes-dependents',
  housingTypes: 'clientes-housing-type',
  municipalities: 'clientes-municipality',
}

type ActivitiesCache = Record<string, EconomicActivityCatalog[]>

export const useClientLookups = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)

  const [catalogs, setCatalogs] = useState<{
    sectors: ClientCatalogItem[]
    civilStatus: ClientCatalogItem[]
    genders: ClientCatalogItem[]
    professions: ClientCatalogItem[]
    dependents: ClientCatalogItem[]
    housingTypes: ClientCatalogItem[]
    departments: Department[]
    municipalities: Municipality[]
  }>({
    sectors: [],
    civilStatus: [],
    genders: [],
    professions: [],
    dependents: [],
    housingTypes: [],
    departments: [],
    municipalities: [],
  })

  const [activitiesBySector, setActivitiesBySector] = useState<ActivitiesCache>(
    {},
  )
  const [activeSectorId, setActiveSectorId] = useState<string | null>(null)

  const activeActivities = useMemo(() => {
    const cacheKey = activeSectorId ?? 'all'
    return activitiesBySector[cacheKey] ?? []
  }, [activitiesBySector, activeSectorId])

  const fetchBaseLookups = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const [
      sectors,
      civilStatus,
      genders,
      professions,
      dependents,
      housingTypes,
      departments,
    ] = await Promise.all([
      listClientCatalogsAction({
        parentSlug: LOOKUP_SLUGS.sectors,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      }),
      listClientCatalogsAction({
        parentSlug: LOOKUP_SLUGS.civilStatus,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      }),
      listClientCatalogsAction({
        parentSlug: LOOKUP_SLUGS.genders,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      }),
      listClientCatalogsAction({
        parentSlug: LOOKUP_SLUGS.professions,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      }),
      listClientCatalogsAction({
        parentSlug: LOOKUP_SLUGS.dependents,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      }),
      listClientCatalogsAction({
        parentSlug: LOOKUP_SLUGS.housingTypes,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      }),
      listDepartmentsAction(),
    ])

    const catalogError = [
      sectors,
      civilStatus,
      genders,
      professions,
      dependents,
      housingTypes,
      departments,
    ].find((result) => !result.success)?.error ?? null

    if (
      sectors.success &&
      civilStatus.success &&
      genders.success &&
      professions.success &&
      dependents.success &&
      housingTypes.success
    ) {
      setCatalogs({
        sectors: sectors.data.items,
        civilStatus: civilStatus.data.items,
        genders: genders.data.items,
        professions: professions.data.items,
        dependents: dependents.data.items,
        housingTypes: housingTypes.data.items,
        municipalities: [],
        departments: departments.success ? departments.data : [],
      })
    } else {
      setCatalogs((prev) => ({ ...prev }))
    }

    const municipalities = await listMunicipalitiesAction()

    if (municipalities.success) {
      setCatalogs((prev) => ({
        ...prev,
        municipalities: municipalities.data,
      }))
    }

    setError(
      catalogError ??
        (departments.success ? null : departments.error ?? null) ??
        (municipalities.success ? null : municipalities.error ?? null),
    )
    setIsLoading(false)
  }, [])

  const fetchActivitiesForSector = useCallback(
    async (sectorId?: string | null) => {
      const cacheKey = sectorId ?? 'all'
      if (activitiesBySector[cacheKey]) {
        setActiveSectorId(sectorId ?? null)
        return
      }
      setIsLoadingActivities(true)
      setActivitiesError(null)
      const result = await listEconomicActivitiesAction({
        sectorId: sectorId || undefined,
        onlyActive: true,
        pageNumber: 1,
        pageSize: 200,
      })
      if (result.success) {
        setActivitiesBySector((prev) => ({
          ...prev,
          [cacheKey]: result.data.items,
        }))
        setActiveSectorId(sectorId ?? null)
      } else {
        setActivitiesError(result.error)
      }
      setIsLoadingActivities(false)
    },
    [activitiesBySector],
  )

  useEffect(() => {
    void fetchBaseLookups()
    void fetchActivitiesForSector(null)
  }, [fetchBaseLookups, fetchActivitiesForSector])

  return {
    ...catalogs,
    activities: activeActivities,
    isLoading,
    isLoadingActivities,
    error,
    activitiesError,
    refreshLookups: fetchBaseLookups,
    loadActivitiesForSector: fetchActivitiesForSector,
    activitiesBySector,
    activeSectorId,
  }
}
