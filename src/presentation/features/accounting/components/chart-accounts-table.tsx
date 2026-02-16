import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TableContainer } from '@/presentation/share/components/table-container'

interface ChildrenMap {
  [parentId: string]: {
    items: ChartAccountListItem[]
    isLoading: boolean
    error: string | null
    loaded: boolean
  }
}

interface ChartAccountsTableProps {
  accounts: ChartAccountListItem[]
  childrenByParent: ChildrenMap
  expandedIds: Set<string>
  onToggleExpand: (accountId: string, isGroup: boolean) => void
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onEdit: (account: ChartAccountListItem) => void
  onCreateChild?: (account: ChartAccountListItem) => void
}

export const ChartAccountsTable = ({
  accounts,
  childrenByParent,
  expandedIds,
  onToggleExpand,
  isLoading,
  error,
  page,
  totalPages,
  onEdit,
  onCreateChild,
}: ChartAccountsTableProps) => {
  void page
  void totalPages

  const renderRows = (
    items: ChartAccountListItem[],
    level: number,
    path: string,
  ): JSX.Element[] => {
    return items.flatMap((account, index) => {
      const isExpanded = expandedIds.has(account.id)
      const childrenState = childrenByParent[account.id]
      const hasChildren = (childrenState?.items.length ?? 0) > 0
      const rowKey = `${path}-${account.id}-${index}`
      const rows: JSX.Element[] = [
        <div
          key={rowKey}
          className="grid grid-cols-5 items-center gap-3 px-3 py-2 text-[13px] hover:bg-slate-50/70 dark:hover:bg-slate-900"
          role="treeitem"
          aria-expanded={account.isGroup ? isExpanded : undefined}
        >
          <div className="col-span-2 flex items-center gap-2">
            <div style={{ width: level * 16 }} />
            {account.isGroup ? (
              <button
                type="button"
                onClick={() => onToggleExpand(account.id, account.isGroup)}
                className="btn-table-action w-7 px-0"
                aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
              >
                {childrenState?.isLoading ? (
                  <SpinnerIcon className="h-4 w-4 animate-spin" />
                ) : isExpanded ? (
                  <ChevronDownIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="h-7 w-7" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {account.code}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {account.name} • {account.slug}
              </span>
            </div>
          </div>
          <div className="text-slate-800 dark:text-slate-100">
            {account.isGroup ? 'Grupo' : 'Posteable'}
          </div>
          <div className="text-slate-800 dark:text-slate-100">
            {account.normalBalance === 'debit' ? 'Debe' : 'Haber'}
          </div>
          <div className="flex items-center justify-between gap-2">
            <AccountingStatusBadge isActive={account.isActive} />
            <div className="flex items-center gap-2">
              {account.isGroup && onCreateChild ? (
                <button
                  type="button"
                  onClick={() => onCreateChild(account)}
                  className="btn-table-action"
                >
                  Nuevo hijo
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onEdit(account)}
                className="btn-table-action"
              >
                Editar
              </button>
            </div>
          </div>
        </div>,
      ]

      if (account.isGroup && isExpanded) {
            if (childrenState?.isLoading) {
              rows.push(
                <div
                  key={`${rowKey}-loading`}
                  className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  Cargando subcuentas...
                </div>,
              )
            } else if (childrenState?.error) {
              rows.push(
                <div
                  key={`${rowKey}-error`}
                  className="px-4 py-2 text-xs text-red-600 dark:text-red-300"
                >
                  {childrenState.error}
                </div>,
              )
            } else if (hasChildren) {
          rows.push(...renderRows(childrenState.items, level + 1, `${rowKey}-child`))
        } else {
              rows.push(
                <div
                  key={`${rowKey}-empty`}
                  className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  No hay subcuentas para esta cuenta.
                </div>,
              )
            }
      }

      return rows
    })
  }

  return (
    <TableContainer mode="legacy-compact">
      <div className="divide-y divide-slate-200 dark:divide-slate-800" role="tree">
        {isLoading ? (
          <div className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Cargando plan de cuentas...
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        ) : !accounts.length ? (
          <div className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
            No hay cuentas registradas con los filtros actuales.
          </div>
        ) : (
          renderRows(accounts, 0, 'root')
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
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)
