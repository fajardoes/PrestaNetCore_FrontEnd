import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { MunicipalityFormValues } from '@/infrastructure/validations/organization/municipality.schema'
import type {
  Municipality,
} from '@/infrastructure/interfaces/organization/geography'
import { useMunicipalities } from '@/presentation/features/organization/hooks/use-municipalities'
import { useDepartments } from '@/presentation/features/organization/hooks/use-departments'
import { useSaveMunicipality } from '@/presentation/features/organization/hooks/use-save-municipality'
import { MunicipalitiesTable } from '@/presentation/features/organization/components/municipalities-table'
import { MunicipalityModal } from '@/presentation/features/organization/components/municipality-modal'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const PAGE_SIZE = 10

export const MunicipalitiesPage = () => {
  const { user } = useAuth()
  const isAdmin =
    user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false

  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [departmentFilter, setDepartmentFilter] = useState<string>('')
  const [editingMunicipality, setEditingMunicipality] =
    useState<Municipality | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const {
    municipalities,
    isLoading,
    error,
    refresh: refreshMunicipalities,
  } = useMunicipalities({ enabled: isAdmin })
  const {
    departments,
    isLoading: isLoadingDepartments,
    error: departmentsError,
    refresh: refreshDepartments,
  } = useDepartments({ enabled: isAdmin })
  const { saveMunicipality, isSaving, error: saveError } =
    useSaveMunicipality()

  const visibleMunicipalities = useMemo(() => {
    if (status === 'all') return municipalities
    return municipalities.filter((municipality) =>
      status === 'active' ? municipality.activo : !municipality.activo,
    )
  }, [municipalities, status])

  const byDepartment = useMemo(() => {
    if (!departmentFilter) return visibleMunicipalities
    return visibleMunicipalities.filter(
      (municipality) => municipality.departmentId === departmentFilter,
    )
  }, [departmentFilter, visibleMunicipalities])

  const filteredMunicipalities = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return byDepartment
    return byDepartment.filter((municipality) => {
      return (
        municipality.name.toLowerCase().includes(term) ||
        municipality.slug.toLowerCase().includes(term) ||
        municipality.departmentName.toLowerCase().includes(term)
      )
    })
  }, [byDepartment, query])

  const totalPages = Math.max(1, Math.ceil(filteredMunicipalities.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedMunicipalities = useMemo(
    () =>
      filteredMunicipalities.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [currentPage, filteredMunicipalities],
  )

  const combinedError = error ?? departmentsError ?? null

  const sortedDepartments = useMemo(
    () =>
      [...departments].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [departments],
  )

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar municipios.
        </p>
      </div>
    )
  }

  const handleSave = async (values: MunicipalityFormValues) => {
    const result = await saveMunicipality(values, editingMunicipality?.id)
    if (result.success) {
      setEditingMunicipality(null)
      setIsCreateOpen(false)
      await refreshMunicipalities()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Organización - Municipios
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra los municipios asociados a cada departamento para usarlos en clientes y reportes.
        </p>
      </div>

      <ListFiltersBar
        search={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        placeholder="Buscar por municipio, departamento o slug..."
        status={status}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        children={
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40 md:w-64"
            value={departmentFilter}
            onChange={(event) => {
              setDepartmentFilter(event.target.value)
              setPage(1)
            }}
            disabled={isLoadingDepartments}
          >
            <option value="">Todos los departamentos</option>
            {sortedDepartments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => {
                void refreshDepartments()
                void refreshMunicipalities()
              }}
              disabled={isLoading || isLoadingDepartments}
            >
              Refrescar catálogos
            </button>
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                setEditingMunicipality(null)
                setIsCreateOpen(true)
              }}
              disabled={!departments.length}
            >
              Nuevo municipio
            </button>
          </div>
        }
      />

      <MunicipalitiesTable
        municipalities={paginatedMunicipalities}
        isLoading={isLoading || isLoadingDepartments}
        error={combinedError}
        onEdit={(municipality) => {
          setEditingMunicipality(municipality)
          setIsCreateOpen(false)
        }}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

      <MunicipalityModal
        open={isCreateOpen || Boolean(editingMunicipality)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingMunicipality(null)
        }}
        onSubmit={handleSave}
        departments={sortedDepartments}
        isSaving={isSaving}
        error={saveError}
        municipality={editingMunicipality}
      />
    </div>
  )
}
