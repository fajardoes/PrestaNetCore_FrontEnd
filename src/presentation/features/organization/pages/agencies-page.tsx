import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { AgencyFormValues } from '@/infrastructure/validations/catalog/agency.schema'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useSaveAgency } from '@/presentation/features/catalog/hooks/use-save-agency'
import { AgenciesTable } from '@/presentation/features/organization/components/agencies-table'
import { AgencyModal } from '@/presentation/features/organization/components/agency-modal'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const PAGE_SIZE = 10

export const AgenciesPage = () => {
  const { user } = useAuth()
  const isAdmin =
    user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false
  const { agencies, isLoading, error, refresh } = useAgencies({
    enabled: isAdmin,
  })
  const {
    createAgency,
    updateAgency,
    isSaving,
    error: saveError,
  } = useSaveAgency()

  const [editingAgency, setEditingAgency] = useState<Agency | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar agencias.
        </p>
      </div>
    )
  }

  const handleSave = async (values: AgencyFormValues) => {
    if (editingAgency) {
      const result = await updateAgency(editingAgency.id, values)
      if (result.success) {
        setEditingAgency(null)
        await refresh()
      }
      return
    }
    const result = await createAgency(values)
    if (result.success) {
      setIsCreateOpen(false)
      await refresh()
    }
  }

  const visibleAgencies = useMemo(() => {
    if (status === 'all') return agencies
    return agencies.filter((agency) =>
      status === 'active' ? agency.isActive : !agency.isActive,
    )
  }, [agencies, status])

  const filteredAgencies = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return visibleAgencies
    return visibleAgencies.filter((agency) => {
      return (
        agency.name.toLowerCase().includes(term) ||
        agency.code.toLowerCase().includes(term) ||
        agency.slug.toLowerCase().includes(term)
      )
    })
  }, [query, visibleAgencies])

  const totalPages = Math.max(1, Math.ceil(filteredAgencies.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedAgencies = useMemo(
    () =>
      filteredAgencies.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [currentPage, filteredAgencies],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Organización - Agencias
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra las agencias disponibles para asignar a los usuarios.
        </p>
      </div>

      <ListFiltersBar
        search={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        placeholder="Buscar por nombre, código o slug..."
        status={status}
        onStatusChange={(value) => {
          setStatus(value)
          setPage(1)
        }}
        actions={
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              setEditingAgency(null)
              setIsCreateOpen(true)
            }}
          >
            Nueva agencia
          </button>
        }
      />

      <AgenciesTable
        agencies={paginatedAgencies}
        isLoading={isLoading}
        error={error}
        onEdit={(agency) => {
          setEditingAgency(agency)
          setIsCreateOpen(false)
        }}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

      <AgencyModal
        open={isCreateOpen || Boolean(editingAgency)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingAgency(null)
        }}
        onSubmit={handleSave}
        isSaving={isSaving}
        error={saveError}
        agency={editingAgency}
      />
    </div>
  )
}
