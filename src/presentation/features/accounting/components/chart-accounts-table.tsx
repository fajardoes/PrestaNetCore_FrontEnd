import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import { AccountingStatusBadge } from './accounting-status-badge'
import { TableTabular } from '@/presentation/share/components/table-tabular'

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

interface VisibleChartAccountRow {
  account: ChartAccountListItem
  level: number
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

  const buildVisibleRows = (
    items: ChartAccountListItem[],
    level: number,
  ): VisibleChartAccountRow[] =>
    items.flatMap((account) => {
      const rows: VisibleChartAccountRow[] = [{ account, level }]
      const childrenState = childrenByParent[account.id]

      if (
        account.isGroup &&
        expandedIds.has(account.id) &&
        childrenState?.items.length
      ) {
        rows.push(...buildVisibleRows(childrenState.items, level + 1))
      }

      return rows
    })

  const visibleRows = buildVisibleRows(accounts, 0)
  const columns = [
    {
      key: 'account',
      header: 'Cuenta',
      className: 'min-w-[330px]',
      render: ({ account, level }: VisibleChartAccountRow) => {
        const isExpanded = expandedIds.has(account.id)
        const childrenState = childrenByParent[account.id]
        const isEmptyExpandedGroup =
          account.isGroup &&
          isExpanded &&
          !childrenState?.isLoading &&
          !childrenState?.error &&
          !childrenState?.items.length

        return (
          <span className="flex items-start gap-2">
            <span className="inline-block shrink-0" style={{ width: level * 16 }} />
            {account.isGroup ? (
              <button
                type="button"
                onClick={() => onToggleExpand(account.id, account.isGroup)}
                className="btn-table-action w-7 shrink-0 px-0"
                aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
              >
                {childrenState?.isLoading ? (
                  <SpinnerIcon className="mx-auto h-4 w-4 animate-spin" />
                ) : isExpanded ? (
                  <ChevronDownIcon className="mx-auto h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="mx-auto h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="h-7 w-7 shrink-0" />
            )}
            <span className="flex flex-col">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {account.code}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {account.name} • {account.slug}
              </span>
              {account.isGroup && isExpanded && childrenState?.isLoading ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Cargando subcuentas...
                </span>
              ) : null}
              {account.isGroup && isExpanded && childrenState?.error ? (
                <span className="text-xs text-red-600 dark:text-red-300">
                  {childrenState.error}
                </span>
              ) : null}
              {isEmptyExpandedGroup ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  No hay subcuentas para esta cuenta.
                </span>
              ) : null}
            </span>
          </span>
        )
      },
      getTitle: ({ account }: VisibleChartAccountRow) =>
        `${account.code} - ${account.name} - ${account.slug}`,
    },
    {
      key: 'type',
      header: 'Tipo',
      className: 'min-w-[95px]',
      render: ({ account }: VisibleChartAccountRow) =>
        account.isGroup ? 'Grupo' : 'Posteable',
      getTitle: ({ account }: VisibleChartAccountRow) =>
        account.isGroup ? 'Grupo' : 'Posteable',
    },
    {
      key: 'balance',
      header: 'Naturaleza',
      className: 'min-w-[95px]',
      render: ({ account }: VisibleChartAccountRow) =>
        account.normalBalance === 'debit' ? 'Debe' : 'Haber',
      getTitle: ({ account }: VisibleChartAccountRow) =>
        account.normalBalance === 'debit' ? 'Debe' : 'Haber',
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'min-w-[100px]',
      render: ({ account }: VisibleChartAccountRow) => (
        <AccountingStatusBadge isActive={account.isActive} />
      ),
      getTitle: ({ account }: VisibleChartAccountRow) =>
        account.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[185px]',
      render: ({ account }: VisibleChartAccountRow) => (
        <span className="flex items-center justify-end gap-2">
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
        title="Plan de cuentas"
        columns={columns}
        rows={visibleRows}
        rowKey={({ account }) => account.id}
        isLoading={isLoading}
        loadingMessage="Cargando plan de cuentas..."
        emptyMessage={error ? 'No fue posible cargar el plan de cuentas.' : 'No hay cuentas registradas con los filtros actuales.'}
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
