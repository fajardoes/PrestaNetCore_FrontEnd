import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { DepartmentFormValues } from '@/infrastructure/validations/organization/department.schema'
import type { Department } from '@/infrastructure/interfaces/organization/geography'
import { useDepartments } from '@/presentation/features/organization/hooks/use-departments'
import { useSaveDepartment } from '@/presentation/features/organization/hooks/use-save-department'
import { DepartmentsTable } from '@/presentation/features/organization/components/departments-table'
import { DepartmentModal } from '@/presentation/features/organization/components/department-modal'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const PAGE_SIZE = 10

export const DepartmentsPage = () => {
  const { user } = useAuth()
  const isAdmin =
    user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false

  const { departments, isLoading, error, refresh } = useDepartments({
    enabled: isAdmin,
  })
  const { saveDepartment, isSaving, error: saveError } = useSaveDepartment()

  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null,
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar departamentos.
        </p>
      </div>
    )
  }

  const handleSave = async (values: DepartmentFormValues) => {
    const result = await saveDepartment(values, editingDepartment?.id)
    if (result.success) {
      setEditingDepartment(null)
      setIsCreateOpen(false)
      await refresh()
    }
  }

  const visibleDepartments = useMemo(() => {
    if (status === 'all') return departments
    return departments.filter((department) =>
      status === 'active' ? department.activo : !department.activo,
    )
  }, [departments, status])

  const filteredDepartments = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return visibleDepartments
    return visibleDepartments.filter((department) => {
      return (
        department.name.toLowerCase().includes(term) ||
        department.slug.toLowerCase().includes(term) ||
        department.code.toLowerCase().includes(term)
      )
    })
  }, [query, visibleDepartments])

  const totalPages = Math.max(1, Math.ceil(filteredDepartments.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedDepartments = useMemo(
    () =>
      filteredDepartments.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [currentPage, filteredDepartments],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Organización - Departamentos
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Gestiona los departamentos disponibles para asignar municipios y clientes.
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
              setEditingDepartment(null)
              setIsCreateOpen(true)
            }}
          >
            Nuevo departamento
          </button>
        }
      />

      <DepartmentsTable
        departments={paginatedDepartments}
        isLoading={isLoading}
        error={error}
        onEdit={(department) => {
          setEditingDepartment(department)
          setIsCreateOpen(false)
        }}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
      />

      <DepartmentModal
        open={isCreateOpen || Boolean(editingDepartment)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingDepartment(null)
        }}
        onSubmit={handleSave}
        isSaving={isSaving}
        error={saveError}
        department={editingDepartment}
      />
    </div>
  )
}
