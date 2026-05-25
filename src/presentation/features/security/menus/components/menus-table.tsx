import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'
import { TableTabular } from '@/presentation/share/components/table-tabular'

interface VisibleMenuRow {
  item: MenuItemAdminDto
  level: number
}

interface MenusTableProps {
  items: MenuItemAdminDto[]
  expandedIds: Set<string>
  onToggleExpand: (menuId: string) => void
  isLoading: boolean
  error: string | null
  onEdit: (item: MenuItemAdminDto) => void
  onDelete: (item: MenuItemAdminDto) => void
}

export const MenusTable = ({
  items,
  expandedIds,
  onToggleExpand,
  isLoading,
  error,
  onEdit,
  onDelete,
}: MenusTableProps) => {
  const buildVisibleRows = (
    entries: MenuItemAdminDto[],
    level: number,
  ): VisibleMenuRow[] => {
    return entries.flatMap((item) => {
      const hasChildren = Boolean(item.children?.length)
      const isExpanded = expandedIds.has(item.id)
      const row = { item, level }

      if (hasChildren && isExpanded) {
        return [row, ...buildVisibleRows(item.children ?? [], level + 1)]
      }

      return [row]
    })
  }

  const rows = buildVisibleRows(items, 0)
  const columns = [
    {
      key: 'menu',
      header: 'Menu',
      className: 'min-w-[280px]',
      render: ({ item, level }: VisibleMenuRow) => {
        const hasChildren = Boolean(item.children?.length)
        const isExpanded = expandedIds.has(item.id)

        return (
          <span
            className="flex items-center gap-2"
            style={{ paddingLeft: level * 16 }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpand(item.id)}
                className="btn-table-action w-7 px-0"
                aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
              >
                {isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="h-7 w-7" />
            )}
            {item.icon ? (
              <span className="rounded-md bg-slate-100 px-1.5 py-1 text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                <MenuIcon iconName={item.icon} className="h-4 w-4" />
              </span>
            ) : null}
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {item.title}
            </span>
          </span>
        )
      },
      getTitle: ({ item }: VisibleMenuRow) => item.title,
    },
    {
      key: 'route',
      header: 'Ruta',
      className: 'min-w-[180px]',
      render: ({ item }: VisibleMenuRow) => item.route ?? 'Contenedor',
      getTitle: ({ item }: VisibleMenuRow) => item.route ?? 'Contenedor',
    },
    {
      key: 'order',
      header: 'Orden',
      render: ({ item }: VisibleMenuRow) => item.order,
      getTitle: ({ item }: VisibleMenuRow) => String(item.order),
    },
    {
      key: 'status',
      header: 'Estado',
      render: ({ item }: VisibleMenuRow) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
            item.isActive
              ? 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40'
              : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
          }`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: ({ item }: VisibleMenuRow) =>
        item.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[120px]',
      render: ({ item }: VisibleMenuRow) => (
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="btn-table-action"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="btn-table-action w-7 px-0"
            aria-label="Eliminar menu"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {error}
        </div>
      ) : null}

      <TableTabular
        title="Listado de menus"
        columns={columns}
        rows={rows}
        rowKey={({ item }) => item.id}
        isLoading={isLoading}
        loadingMessage="Cargando menus..."
        emptyMessage={error ? 'No fue posible cargar los menus.' : 'No hay menus registrados.'}
        maxHeightClassName="max-h-[640px]"
      />
    </div>
  )
}

const ChevronRightIcon = ({ className }: { className?: string }) => (
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
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
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
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const TrashIcon = ({ className }: { className?: string }) => (
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
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
  </svg>
)
