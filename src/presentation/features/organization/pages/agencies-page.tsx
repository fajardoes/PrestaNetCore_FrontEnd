import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { AgencyFormValues } from '@/infrastructure/validations/catalog/agency.schema'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useSaveAgency } from '@/presentation/features/catalog/hooks/use-save-agency'
import { AgenciesTable } from '@/presentation/features/organization/components/agencies-table'
import { AgencyModal } from '@/presentation/features/organization/components/agency-modal'

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
  const [showInactive, setShowInactive] = useState(true)

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

  const visibleAgencies = showInactive
    ? agencies
    : agencies.filter((agency) => agency.isActive)

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

      <div className="flex justify-end">
        <label className="mr-auto inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Mostrar inactivas
        </label>
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
      </div>

      <AgenciesTable
        agencies={visibleAgencies}
        isLoading={isLoading}
        error={error}
        onEdit={(agency) => {
          setEditingAgency(agency)
          setIsCreateOpen(false)
        }}
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
