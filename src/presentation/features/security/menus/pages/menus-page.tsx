import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { MenuFormValues } from '@/infrastructure/validations/security/menu.schema'
import type { MenuItemAdminDto } from '@/infrastructure/interfaces/security/menu'
import { useAssignRoles } from '@/presentation/features/security/hooks/use-assign-roles'
import { useAdminMenus } from '@/presentation/features/security/menus/hooks/use-admin-menus'
import { useSaveMenu } from '@/presentation/features/security/menus/hooks/use-save-menu'
import { useDeleteMenu } from '@/presentation/features/security/menus/hooks/use-delete-menu'
import { MenusTable } from '@/presentation/features/security/menus/components/menus-table'
import { MenuModal } from '@/presentation/features/security/menus/components/menu-modal'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const PAGE_SIZE = 10

const normalizeTree = (menus: MenuItemAdminDto[]): MenuItemAdminDto[] => {
  const hasChildren = menus.some((menu) => Array.isArray(menu.children))
  if (hasChildren) {
    return menus.map((menu) => ({
      ...menu,
      children: Array.isArray(menu.children) ? menu.children : [],
    }))
  }

  const map = new Map<string, MenuItemAdminDto & { children: MenuItemAdminDto[] }>()
  menus.forEach((menu) => {
    map.set(menu.id, { ...menu, children: [] })
  })

  const roots: MenuItemAdminDto[] = []
  map.forEach((menu) => {
    if (menu.parentId && map.has(menu.parentId)) {
      map.get(menu.parentId)?.children?.push(menu)
    } else {
      roots.push(menu)
    }
  })

  const sortNodes = (items: MenuItemAdminDto[]) => {
    items.sort((a, b) => a.order - b.order)
    items.forEach((item) => {
      if (item.children?.length) {
        sortNodes(item.children)
      }
    })
  }

  sortNodes(roots)
  return roots
}

const flattenTree = (
  items: MenuItemAdminDto[],
  depth = 0,
): { item: MenuItemAdminDto; depth: number }[] => {
  return items.flatMap((item) => {
    const rows = [{ item, depth }]
    if (item.children?.length) {
      rows.push(...flattenTree(item.children, depth + 1))
    }
    return rows
  })
}

const findNode = (
  items: MenuItemAdminDto[],
  targetId: string,
): MenuItemAdminDto | null => {
  for (const item of items) {
    if (item.id === targetId) return item
    if (item.children?.length) {
      const found = findNode(item.children, targetId)
      if (found) return found
    }
  }
  return null
}

const collectIds = (
  item: MenuItemAdminDto,
  bucket: Set<string>,
) => {
  bucket.add(item.id)
  item.children?.forEach((child) => collectIds(child, bucket))
}

const buildParentOptions = (
  items: MenuItemAdminDto[],
  excluded: Set<string>,
  depth = 0,
): { id: string; label: string }[] => {
  return items.flatMap((item) => {
    if (excluded.has(item.id)) {
      return []
    }
    const labelPrefix = depth > 0 ? `${'--'.repeat(depth)} ` : ''
    const current = [{ id: item.id, label: `${labelPrefix}${item.title}` }]
    const children = item.children?.length
      ? buildParentOptions(item.children, excluded, depth + 1)
      : []
    return [...current, ...children]
  })
}

export const MenusPage = () => {
  const { user } = useAuth()
  const isAdmin = useMemo(
    () =>
      user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false,
    [user?.roles],
  )

  const { menus, isLoading, error, refresh } = useAdminMenus({
    enabled: isAdmin,
  })
  const {
    roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useAssignRoles({ enabled: isAdmin })
  const { createMenu, updateMenu, isSaving, error: saveError } = useSaveMenu()
  const { deleteMenu, isDeleting, error: deleteError } = useDeleteMenu()

  const [editingMenu, setEditingMenu] = useState<MenuItemAdminDto | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const handleSave = async (values: MenuFormValues) => {
    if (editingMenu) {
      const result = await updateMenu(editingMenu.id, values)
      if (result.success) {
        setEditingMenu(null)
        await refresh()
      }
      return
    }
    const result = await createMenu(values)
    if (result.success) {
      setIsCreateOpen(false)
      await refresh()
    }
  }

  const handleDelete = async (menu: MenuItemAdminDto) => {
    if (!window.confirm('¿Eliminar este menu? Esta accion es permanente.')) {
      return
    }
    const result = await deleteMenu(menu.id)
    if (result.success) {
      await refresh()
    }
  }

  const visibleMenus = useMemo(() => {
    if (status === 'all') return menus
    return menus.filter((menu) =>
      status === 'active' ? menu.isActive : !menu.isActive,
    )
  }, [menus, status])

  const filteredMenus = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return visibleMenus
    return visibleMenus.filter((menu) => {
      return (
        menu.title.toLowerCase().includes(term) ||
        menu.slug.toLowerCase().includes(term) ||
        (menu.route ?? '').toLowerCase().includes(term)
      )
    })
  }, [query, visibleMenus])

  const tree = useMemo(() => normalizeTree(filteredMenus), [filteredMenus])
  const rows = useMemo(() => flattenTree(tree), [tree])
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedRows = useMemo(
    () =>
      rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, rows],
  )

  const fullTree = useMemo(() => normalizeTree(menus), [menus])
  const excludedIds = useMemo(() => {
    if (!editingMenu) return new Set<string>()
    const found = findNode(fullTree, editingMenu.id)
    if (!found) return new Set<string>([editingMenu.id])
    const bucket = new Set<string>()
    collectIds(found, bucket)
    return bucket
  }, [editingMenu, fullTree])

  const parentOptions = useMemo(
    () => buildParentOptions(fullTree, excludedIds),
    [fullTree, excludedIds],
  )

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar menus.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Seguridad - Menus
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra los menus visibles para cada rol.
        </p>
        {rolesError ? (
          <p className="text-xs text-red-500">
            No fue posible cargar los roles: {rolesError}
          </p>
        ) : null}
        {deleteError ? (
          <p className="text-xs text-red-500">
            No fue posible eliminar el menu: {deleteError}
          </p>
        ) : null}
      </div>

      <ListFiltersBar
        search={query}
        onSearchChange={(value) => {
          setQuery(value)
          setPage(1)
        }}
        placeholder="Buscar por titulo, slug o ruta..."
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
              setEditingMenu(null)
              setIsCreateOpen(true)
            }}
            disabled={isLoading || isSaving || isDeleting}
          >
            Nuevo menu
          </button>
        }
      />

      <MenusTable
        rows={paginatedRows}
        isLoading={isLoading}
        error={error}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
        onEdit={(menu) => {
          setEditingMenu(menu)
          setIsCreateOpen(false)
        }}
        onDelete={handleDelete}
      />

      <MenuModal
        open={isCreateOpen || Boolean(editingMenu)}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingMenu(null)
        }}
        onSubmit={handleSave}
        isSaving={isSaving}
        error={saveError}
        menu={editingMenu}
        parentOptions={parentOptions}
        availableRoles={roles}
        rolesLoading={rolesLoading}
      />
    </div>
  )
}
