import { useMemo, useState } from 'react'
import { deleteClientAction } from '@/core/actions/clients/delete-client.action'
import { toggleClientAction } from '@/core/actions/clients/toggle-client.action'
import type { ClientFormValues } from '@/infrastructure/validations/clients/client.schema'
import type {
  ClientCreatePayload,
  ClientListItem,
} from '@/infrastructure/interfaces/clients/client'
import { useClientLookups } from '@/presentation/features/clients/hooks/use-client-lookups'
import { useClientsExplorer } from '@/presentation/features/clients/hooks/use-clients-explorer'
import { useClientDetail } from '@/presentation/features/clients/hooks/use-client-detail'
import { useSaveClient } from '@/presentation/features/clients/hooks/use-save-client'
import { ClientsTable } from '@/presentation/features/clients/components/clients-table'
import { ClientForm } from '@/presentation/features/clients/components/client-form'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { mapGeneroEnumToOption, mapGeneroToEnum } from '@/core/helpers/genero-mapper'

export const ClientsPage = () => {
  const {
    sectors,
    civilStatus,
    genders,
    professions,
    dependents,
    housingTypes,
    municipalities,
    activities,
    isLoading: isLoadingLookups,
    error: lookupError,
    activitiesError,
  } = useClientLookups()

  const {
    clients,
    error: listError,
    isLoading: isLoadingList,
    page,
    totalPages,
    filters,
    setFilters,
    setPage,
    refresh,
    updateActive,
  } = useClientsExplorer()

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const {
    client: clientDetail,
    error: detailError,
    refresh: refreshDetail,
    setClient,
  } = useClientDetail(selectedClientId)

  const { saveClient, isSaving, error: saveError, resetError } = useSaveClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const filtersError = lookupError ?? activitiesError ?? null

  const activitiesBySector = useMemo(() => {
    const map: Record<string, typeof activities> = {}
    activities.forEach((activity) => {
      if (!map[activity.sectorId]) {
        map[activity.sectorId] = []
      }
      map[activity.sectorId].push(activity)
    })
    return map
  }, [activities])

  const initialValues = useMemo(() => {
    if (!clientDetail) return undefined
    return {
      ...clientDetail,
      genero: mapGeneroEnumToOption(clientDetail.genero),
      referencias: clientDetail.referencias.map((ref) => ({
        ...ref,
        activo: ref.activo ?? true,
      })),
      actividades: clientDetail.actividades.map((activity) => ({
        ...activity,
        activo: activity.activo ?? true,
      })),
    } satisfies ClientFormValues
  }, [clientDetail])

  const handleSaveClient = async (values: ClientFormValues) => {
    resetError()
    setActionError(null)
    const payload: ClientCreatePayload = {
      ...values,
      genero: mapGeneroToEnum(values.genero),
      actividades: values.actividades.map(({ sectorId: _sector, ...rest }) => ({
        ...rest,
      })),
    }
    const result = await saveClient(payload, selectedClientId ?? undefined)
    if (result.success) {
      await refresh(1)
      setClient(result.data)
      setIsFormOpen(false)
      setSelectedClientId(result.data.id)
    } else {
      setActionError(result.error)
    }
  }

  const handleSelectClient = (client: ClientListItem) => {
    setSelectedClientId(client.id)
    setIsFormOpen(true)
  }

  const handleToggleClient = async (client: ClientListItem) => {
    setProcessingId(client.id)
    const result = await toggleClientAction(client.id, !client.activo)
    if (result.success) {
      updateActive(client.id, !client.activo)
      if (selectedClientId === client.id) {
        await refreshDetail(client.id)
      }
    } else {
      setActionError(result.error)
    }
    setProcessingId(null)
  }

  const handleDeleteClient = async (client: ClientListItem) => {
    if (
      !window.confirm(
        '¿Eliminar el cliente? Se aplicará un borrado lógico y desaparecerá de los listados.',
      )
    ) {
      return
    }
    setProcessingId(client.id)
    const result = await deleteClientAction(client.id)
    if (result.success) {
      await refresh(1)
      if (selectedClientId === client.id) {
        setIsFormOpen(false)
        setSelectedClientId(null)
        setClient(null)
      }
    } else {
      setActionError(result.error)
    }
    setProcessingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Clientes
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Filtra por sector, estado y género. La paginación aparece al final de la tabla.
        </p>
      </div>

      {isFormOpen ? (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                {selectedClientId ? 'Editar cliente' : 'Nuevo cliente'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Valida identidad (13 dígitos), teléfonos hasta 20 caracteres y una sola actividad principal.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsFormOpen(false)
                setSelectedClientId(null)
                setClient(null)
                setActionError(null)
              }}
              className="btn-icon"
              aria-label="Cerrar formulario"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {detailError && selectedClientId ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {detailError}
            </div>
          ) : null}

          {actionError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {actionError}
            </div>
          ) : null}

          <ClientForm
            initialValues={initialValues}
            isSaving={isSaving}
            onSubmit={handleSaveClient}
            onCancel={() => {
              setIsFormOpen(false)
              setSelectedClientId(null)
              setClient(null)
              setActionError(null)
            }}
            catalogs={{
              sectors,
              civilStatus,
              genders,
              professions,
              dependents,
              housingTypes,
              municipalities,
              activities,
              activitiesBySector,
            }}
            error={saveError}
          />
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <ListFiltersBar
            search={filters.search}
            onSearchChange={(value) => {
              setFilters((prev) => ({ ...prev, search: value }))
              setPage(1)
            }}
            placeholder="Buscar por nombre o identidad..."
            status={filters.activo}
            onStatusChange={(value) => {
              setFilters((prev) => ({ ...prev, activo: value }))
              setPage(1)
            }}
            actions={
              <>
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    setClient(null)
                    setSelectedClientId(null)
                    setIsFormOpen(true)
                  }}
                >
                  Nuevo cliente
                </button>
              </>
            }
          />

          <ClientsTable
            clients={clients}
            isLoading={isLoadingList || isLoadingLookups}
            error={listError ?? filtersError}
            page={page}
            totalPages={Math.max(1, totalPages)}
            onPageChange={(next) =>
              setPage(Math.min(Math.max(1, next), Math.max(1, totalPages)))
            }
            onSelect={(client) => {
              handleSelectClient(client)
              setIsFormOpen(true)
            }}
            onToggle={handleToggleClient}
            onDelete={handleDeleteClient}
            processingId={processingId}
          />
        </div>
      )}
    </div>
  )
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
