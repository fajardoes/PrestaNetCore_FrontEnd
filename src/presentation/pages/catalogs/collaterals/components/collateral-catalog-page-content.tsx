import { useEffect, useMemo, useState } from 'react'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { useNotifications } from '@/providers/NotificationProvider'
import { useCollateralCatalogAdmin } from '@/presentation/features/collaterals/hooks/use-collateral-catalog-admin'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import type { CollateralCatalogItemFormValues } from '@/infrastructure/validations/collaterals/collateral-catalog-item.schema'
import { CollateralCatalogEditorModal } from '@/presentation/pages/catalogs/collaterals/components/collateral-catalog-editor-modal'
import { useAuth } from '@/hooks/useAuth'

interface CollateralCatalogPageContentProps {
  kind: 'types' | 'statuses'
  title: string
  description: string
}

export const CollateralCatalogPageContent = ({
  kind,
  title,
  description,
}: CollateralCatalogPageContentProps) => {
  const { notify } = useNotifications()
  const { user } = useAuth()
  const isAdmin =
    user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false

  const { items, isLoading, isSaving, error, load, create, update, toggleStatus } =
    useCollateralCatalogAdmin(kind)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CollateralCatalogItemDto | null>(
    null,
  )

  useEffect(() => {
    if (!isAdmin) return
    const active =
      status === 'all' ? undefined : status === 'active' ? true : false
    void load(active)
  }, [isAdmin, load, status])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => {
      return (
        item.code.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term)
      )
    })
  }, [items, search])

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden administrar catálogos de garantías.
        </p>
      </div>
    )
  }

  const handleSave = async (values: CollateralCatalogItemFormValues) => {
    const payload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      sortOrder: values.sortOrder ?? 0,
      isActive: values.isActive,
    }

    if (editingItem) {
      const result = await update(editingItem.id, payload)
      if (result.success) {
        notify('Registro actualizado correctamente.', 'success')
        setEditingItem(null)
        setIsModalOpen(false)
        await load(status === 'all' ? undefined : status === 'active')
      }
      return
    }

    const result = await create(payload)
    if (result.success) {
      notify('Registro creado correctamente.', 'success')
      setIsModalOpen(false)
      await load(status === 'all' ? undefined : status === 'active')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>

      <ListFiltersBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por código o nombre..."
        status={status}
        onStatusChange={setStatus}
        actions={
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => {
              setEditingItem(null)
              setIsModalOpen(true)
            }}
          >
            Nuevo
          </button>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  SortOrder
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Activa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Sistema
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Cargando catálogo...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300">
                    {error}
                  </td>
                </tr>
              ) : !filteredItems.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    No hay registros para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.sortOrder}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          item.isActive
                            ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                            : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                        }`}
                      >
                        {item.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.isSystem ? 'Sí' : 'No'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn-icon-label text-xs"
                          onClick={() => {
                            setEditingItem(item)
                            setIsModalOpen(true)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn-icon-label text-xs"
                          disabled={isSaving}
                          onClick={async () => {
                            if (
                              item.isSystem &&
                              item.isActive &&
                              !window.confirm(
                                'Este registro es de sistema. ¿Confirmas desactivarlo?',
                              )
                            ) {
                              return
                            }

                            if (
                              !window.confirm(
                                item.isActive
                                  ? '¿Desactivar este registro?'
                                  : '¿Activar este registro?',
                              )
                            ) {
                              return
                            }

                            const result = await toggleStatus(item.id, !item.isActive)
                            if (result.success) {
                              notify('Estado actualizado correctamente.', 'success')
                              await load(
                                status === 'all'
                                  ? undefined
                                  : status === 'active'
                                    ? true
                                    : false,
                              )
                            }
                          }}
                        >
                          {item.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CollateralCatalogEditorModal
        open={isModalOpen}
        item={editingItem}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleSave}
        isSaving={isSaving}
        error={error}
      />
    </div>
  )
}
