import { useMemo, useState } from 'react'
import { CreateRoleModal } from '@/presentation/features/security/components/create-role-modal'
import { useRolePermissionsAdmin } from '@/presentation/features/security/hooks/use-role-permissions-admin'
import { MessageModal } from '@/presentation/share/components/message-modal'

const MODULE_LABELS: Record<string, string> = {
  loan_applications: 'Solicitudes de credito',
  loans: 'Prestamos',
  accounting: 'Contabilidad',
  clients: 'Clientes',
  security: 'Seguridad',
  collaterals: 'Garantias',
  catalog: 'Catalogos',
  organization: 'Organizacion',
  geography: 'Geografia',
  sales: 'Ventas',
}

const STATUS_TRANSLATIONS: Array<[RegExp, string]> = [
  [/\bDRAFT\b/gi, 'BORRADOR'],
  [/\bSUBMITTED\b/gi, 'ENVIADA'],
  [/\bAPPROVED\b/gi, 'APROBADA'],
  [/\bREJECTED\b/gi, 'RECHAZADA'],
  [/\bCANCELLED\b/gi, 'CANCELADA'],
]

const TERM_TRANSLATIONS: Array<[RegExp, string]> = [
  [/\bcreate\b/gi, 'crear'],
  [/\bview\b/gi, 'ver'],
  [/\bread\b/gi, 'leer'],
  [/\bupdate\b/gi, 'editar'],
  [/\bdelete\b/gi, 'eliminar'],
  [/\bsubmit\b/gi, 'enviar'],
  [/\bapprove\b/gi, 'aprobar'],
  [/\breject\b/gi, 'rechazar'],
  [/\bcancel\b/gi, 'cancelar'],
  [/\breturn to draft\b/gi, 'devolver a borrador'],
  [/\bworkflow\b/gi, 'flujo'],
  [/\bactions?\b/gi, 'acciones'],
  [/\bpermission(s)?\b/gi, 'permiso$1'],
  [/\brole(s)?\b/gi, 'rol$1'],
]

const translatePermissionText = (value?: string | null): string => {
  if (!value) return ''
  let translated = value
  STATUS_TRANSLATIONS.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement)
  })
  TERM_TRANSLATIONS.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement)
  })
  return translated
}

const toModuleLabel = (moduleCode: string): string => {
  const normalized = moduleCode.trim().toLowerCase()
  return MODULE_LABELS[normalized] ?? moduleCode
}

interface FeedbackState {
  tone: 'success' | 'error' | 'info' | 'warning'
  title: string
  description: string
}

export const RolePermissionsPage = () => {
  const {
    roles,
    catalog,
    selectedRoleName,
    assignedPermissions,
    isLoadingRoles,
    isLoadingRoleData,
    isSaving,
    isCreatingRole,
    rolesError,
    roleDataError,
    saveError,
    createRoleError,
    setSelectedRoleName,
    togglePermission,
    replaceAssignedPermissions,
    createRole,
    save,
    loadRoleData,
  } = useRolePermissionsAdmin()

  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return catalog
    return catalog.filter((permission) => {
      const localizedName = translatePermissionText(permission.name)
      const localizedDescription = translatePermissionText(permission.description ?? '')
      return (
        permission.code.toLowerCase().includes(term) ||
        permission.name.toLowerCase().includes(term) ||
        (permission.description ?? '').toLowerCase().includes(term) ||
        localizedName.toLowerCase().includes(term) ||
        localizedDescription.toLowerCase().includes(term)
      )
    })
  }, [catalog, search])

  const assignedSet = useMemo(() => new Set(assignedPermissions), [assignedPermissions])
  const groupedCatalog = useMemo(() => {
    const groups = new Map<
      string,
      typeof filteredCatalog
    >()

    filteredCatalog.forEach((permission) => {
      const [rawModule] = permission.code.split('.')
      const moduleName = rawModule?.trim() ? rawModule.trim() : 'general'
      const current = groups.get(moduleName) ?? []
      current.push(permission)
      groups.set(moduleName, current)
    })

    return Array.from(groups.entries())
      .map(([moduleName, permissions]) => ({
        moduleName: toModuleLabel(moduleName),
        permissions: permissions.sort((a, b) => a.code.localeCompare(b.code)),
      }))
      .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
  }, [filteredCatalog])

  const isUnauthorized = useMemo(() => {
    const errors = [rolesError, roleDataError, saveError, createRoleError]
    return errors.some((error) =>
      (error ?? '').toLowerCase().includes('no autorizado'),
    )
  }, [createRoleError, roleDataError, rolesError, saveError])

  if (isUnauthorized && !isLoadingRoles && !isLoadingRoleData && !roles.length) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permisos para administrar permisos por rol.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Seguridad - Permisos por rol
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Asigna permisos de workflow y operación para cada rol.
        </p>
        {rolesError ? <p className="text-xs text-red-500">{rolesError}</p> : null}
        {createRoleError ? <p className="text-xs text-red-500">{createRoleError}</p> : null}
        {roleDataError ? <p className="text-xs text-red-500">{roleDataError}</p> : null}
        {saveError ? <p className="text-xs text-red-500">{saveError}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Roles
            </h2>
            <button
              type="button"
              className="btn-primary px-3 py-1.5 text-xs"
              onClick={() => setIsCreateRoleOpen(true)}
              disabled={isLoadingRoles || isCreatingRole}
            >
              Nuevo rol
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {isLoadingRoles ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Cargando roles...</p>
            ) : !roles.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No hay roles disponibles.
              </p>
            ) : (
              roles.map((role) => {
                const isSelected = role.name === selectedRoleName
                return (
                  <button
                    key={role.name}
                    type="button"
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      isSelected
                        ? 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-500/50 dark:bg-sky-500/10 dark:text-sky-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setSelectedRoleName(role.name)}
                  >
                    <p className="font-semibold">{role.name}</p>
                    {role.description ? (
                      <p className="text-xs opacity-80">{role.description}</p>
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Permisos asignados
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rol seleccionado: {selectedRoleName || 'Ninguno'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => replaceAssignedPermissions(catalog.map((item) => item.code))}
                disabled={!selectedRoleName || isLoadingRoleData || isSaving || !catalog.length}
              >
                Seleccionar todos
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => replaceAssignedPermissions([])}
                disabled={!selectedRoleName || isLoadingRoleData || isSaving}
              >
                Limpiar
              </button>
              <button
                type="button"
                className="btn-primary px-3 py-1.5 text-xs"
                onClick={async () => {
                  const result = await save()
                  if (result.success) {
                    setFeedback({
                      tone: 'success',
                      title: 'Permisos actualizados',
                      description: 'Los permisos del rol fueron actualizados correctamente.',
                    })
                    void loadRoleData(selectedRoleName)
                    return
                  }
                  setFeedback({
                    tone: 'error',
                    title: 'No se pudo actualizar',
                    description: result.error,
                  })
                }}
                disabled={!selectedRoleName || isLoadingRoleData || isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          <div className="mt-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, nombre o descripción..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div className="mt-3 max-h-[28rem] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
            {isLoadingRoleData ? (
              <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                Cargando permisos...
              </p>
            ) : !selectedRoleName ? (
              <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                Selecciona un rol para administrar sus permisos.
              </p>
            ) : !filteredCatalog.length ? (
              <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                No hay permisos para los filtros actuales.
              </p>
            ) : (
              <div className="space-y-3 p-2">
                {groupedCatalog.map((group) => (
                  <section
                    key={group.moduleName}
                    className="rounded-lg border border-slate-200 dark:border-slate-800"
                  >
                    <header className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      {group.moduleName}
                    </header>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                      {group.permissions.map((permission) => {
                        const checked = assignedSet.has(permission.code)
                        return (
                          <li key={permission.code} className="px-3 py-2">
                            <label className="flex cursor-pointer items-start gap-3">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => togglePermission(permission.code)}
                                disabled={isSaving}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-900"
                              />
                              <span className="min-w-0">
                                <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {translatePermissionText(permission.name)}
                                </span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">
                                  {permission.code}
                                </span>
                                {permission.description ? (
                                  <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-300">
                                    {translatePermissionText(permission.description)}
                                  </span>
                                ) : null}
                              </span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <CreateRoleModal
        open={isCreateRoleOpen}
        isSaving={isCreatingRole}
        error={createRoleError}
        onClose={() => setIsCreateRoleOpen(false)}
        onSubmit={async (values) => {
          const result = await createRole(values.name)
          if (result.success) {
            setIsCreateRoleOpen(false)
            setFeedback({
              tone: 'success',
              title: 'Rol creado',
              description: `El rol ${result.role.name} fue creado correctamente.`,
            })
            return
          }
          setFeedback({
            tone: 'error',
            title: 'No se pudo crear el rol',
            description: result.error,
          })
        }}
      />

      <MessageModal
        open={Boolean(feedback)}
        tone={feedback?.tone}
        title={feedback?.title || ''}
        description={feedback?.description || ''}
        onAcknowledge={() => setFeedback(null)}
      />
    </div>
  )
}
