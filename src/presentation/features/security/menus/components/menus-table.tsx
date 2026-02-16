import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'
import { TableContainer } from '@/presentation/share/components/table-container'
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
  const renderRows = (
    entries: MenuItemAdminDto[],
    level: number,
    path: string,
  ): JSX.Element[] => {
    return entries.flatMap((item, index) => {
      const hasChildren = Boolean(item.children?.length)
      const isExpanded = expandedIds.has(item.id)
      const rowKey = `${path}-${item.id}-${index}`
      const rows: JSX.Element[] = [
        <div
          key={rowKey}
          className="grid grid-cols-5 items-center gap-3 px-3 py-2 text-[13px] hover:bg-slate-50/70 dark:hover:bg-slate-900"
          role="treeitem"
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          <div className="col-span-2 flex items-center gap-2">
            <div style={{ width: level * 16 }} />
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
              <div className="h-7 w-7" />
            )}
            <div className="flex flex-col">
              <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                {item.icon ? (
                  <span className="rounded-md bg-slate-100 px-1.5 py-1 text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                    <MenuIcon iconName={item.icon} className="h-4 w-4" />
                  </span>
                ) : null}
                {item.title}
              </span>
            </div>
          </div>
          <div className="text-slate-800 dark:text-slate-100">
            {item.route ?? 'Contenedor'}
          </div>
          <div className="text-slate-800 dark:text-slate-100">{item.order}</div>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                item.isActive
                  ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
                  : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
              }`}
            >
              {item.isActive ? 'Activo' : 'Inactivo'}
            </span>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>,
      ]

      if (hasChildren && isExpanded) {
        rows.push(...renderRows(item.children ?? [], level + 1, `${rowKey}-child`))
      }

      return rows
    })
  }

  return (
    <TableContainer mode="legacy-compact">
      <div className="divide-y divide-slate-200 dark:divide-slate-800" role="tree">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Cargando menus...
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        ) : !items.length ? (
          <div className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
            No hay menus registrados.
          </div>
        ) : (
          renderRows(items, 0, 'root')
        )}
      </div>
    </TableContainer>
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
