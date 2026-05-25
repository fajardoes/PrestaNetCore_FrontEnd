import { useEffect, useMemo, useState } from 'react'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { useNotifications } from '@/providers/NotificationProvider'
import { useCollateralCatalogAdmin } from '@/presentation/features/collaterals/hooks/use-collateral-catalog-admin'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import type { CollateralCatalogItemFormValues } from '@/infrastructure/validations/collaterals/collateral-catalog-item.schema'
import { CollateralCatalogEditorModal } from '@/presentation/pages/catalogs/collaterals/components/collateral-catalog-editor-modal'
import { TableTabular } from '@/presentation/share/components/table-tabular'

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
  const {
    hasPermission,
    isLoading: isLoadingPermissions,
  } = useUserPermissions()
  const canReadCatalogs = hasPermission('collaterals.catalogs.read')
  const canManageCatalogs = hasPermission('collaterals.catalogs.manage')

  const { items, isLoading, isSaving, error, load, create, update, toggleStatus } =
    useCollateralCatalogAdmin(kind)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CollateralCatalogItemDto | null>(
    null,
  )

  useEffect(() => {
    if (!canReadCatalogs) return
    const active =
      status === 'all' ? undefined : status === 'active' ? true : false
    void load(active)
  }, [canReadCatalogs, load, status])

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

  if (isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando permisos...
      </div>
    )
  }

  if (!canReadCatalogs) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para consultar catálogos de garantías.
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

  const columns = [
    {
      key: 'code',
      header: 'Código',
      className: 'min-w-[125px]',
      render: (item: CollateralCatalogItemDto) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100">
          {item.code}
        </span>
      ),
      getTitle: (item: CollateralCatalogItemDto) => item.code,
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'w-[270px] min-w-[270px]',
      render: (item: CollateralCatalogItemDto) => (
        <span className="block w-[250px] whitespace-normal break-words">
          {item.name}
        </span>
      ),
      getTitle: (item: CollateralCatalogItemDto) => item.name,
    },
    {
      key: 'sortOrder',
      header: 'Orden',
      className: 'min-w-[90px]',
      render: (item: CollateralCatalogItemDto) => item.sortOrder,
      getTitle: (item: CollateralCatalogItemDto) => String(item.sortOrder),
    },
    {
      key: 'active',
      header: 'Estado',
      className: 'min-w-[105px]',
      render: (item: CollateralCatalogItemDto) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            item.isActive
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (item: CollateralCatalogItemDto) =>
        item.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'system',
      header: 'Sistema',
      className: 'min-w-[90px]',
      render: (item: CollateralCatalogItemDto) => item.isSystem ? 'Sí' : 'No',
      getTitle: (item: CollateralCatalogItemDto) => item.isSystem ? 'Sí' : 'No',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'w-px whitespace-nowrap',
      render: (item: CollateralCatalogItemDto) => (
        <span className="inline-flex items-center gap-2">
          {canManageCatalogs ? (
            <>
              <button
                type="button"
                className="btn-table-action"
                onClick={() => {
                  setEditingItem(item)
                  setIsModalOpen(true)
                }}
              >
                Editar
              </button>
              <button
                type="button"
                className="btn-table-action"
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
            </>
          ) : null}
        </span>
      ),
    },
  ]

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
          canManageCatalogs ? (
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
          ) : null
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <TableTabular
        title={kind === 'types' ? 'Tipos de garantía' : 'Estados de garantía'}
        columns={columns}
        rows={filteredItems}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando catálogo..."
        emptyMessage={error ? 'No fue posible cargar el catálogo.' : 'No hay registros para los filtros seleccionados.'}
        maxHeightClassName="max-h-[640px]"
      />

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
