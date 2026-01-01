import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useChartAccounts } from '@/presentation/features/accounting/hooks/use-chart-accounts'
import { useChartAccountForm } from '@/presentation/features/accounting/hooks/use-chart-account-form'
import { ChartAccountsTable } from '@/presentation/features/accounting/components/chart-accounts-table'
import { ChartAccountFormModal } from '@/presentation/features/accounting/components/chart-account-form-modal'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

const defaultFormValues = {
  code: '',
  name: '',
  slug: '',
  level: undefined,
  parentId: undefined,
  isGroup: false,
  normalBalance: 'debit' as const,
  isActive: true,
}

export const ChartAccountsPage = () => {
  const { user } = useAuth()
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false

  const {
    chartAccounts,
    rootAccounts,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    refresh,
    expandedIds,
    toggleExpand,
    children,
    parentOptions,
    resetTree,
  } = useChartAccounts({ enabled: isAdmin })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ChartAccountListItem | null>(
    null,
  )

  const {
    form,
    onSubmit,
    isSaving,
    error: formError,
    setError: setFormError,
  } = useChartAccountForm({
    chartAccount: editingAccount,
    onCompleted: async () => {
      setIsModalOpen(false)
      setEditingAccount(null)
      resetTree()
      await refresh()
    },
  })

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar el plan de cuentas.
        </p>
      </div>
    )
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleStatusChange = (value: StatusFilterValue) => {
    setStatusFilter(value)
    setPage(1)
  }

  const openCreate = (parent?: ChartAccountListItem | null) => {
    setEditingAccount(null)
    setFormError(null)
    const nextLevel =
      parent && typeof parent.level === 'number' ? parent.level + 1 : undefined
    form.reset({
      ...defaultFormValues,
      parentId: parent?.id ?? undefined,
      level: nextLevel,
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Plan de cuentas
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra las cuentas contables, sus naturalezas y estructura jerárquica.
        </p>
      </div>

      <ListFiltersBar
        search={search}
        onSearchChange={handleSearchChange}
        placeholder="Buscar por código, nombre o slug..."
        status={statusFilter}
        onStatusChange={handleStatusChange}
        actions={
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => openCreate()}
          >
            Crear cuenta
          </button>
        }
      />

      <ChartAccountsTable
        accounts={rootAccounts}
        childrenByParent={children}
        expandedIds={expandedIds}
        onToggleExpand={toggleExpand}
        isLoading={isLoading}
        error={error}
        onEdit={(account) => {
          setEditingAccount(account)
          setFormError(null)
          setIsModalOpen(true)
          form.reset({
            code: account.code,
            name: account.name,
            slug: account.slug,
            level: account.level,
            parentId: account.parentId ?? undefined,
            isGroup: account.isGroup,
            normalBalance: account.normalBalance,
            isActive: account.isActive,
          })
        }}
        onCreateChild={(account) => openCreate(account)}
      />

      <ChartAccountFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAccount(null)
          setFormError(null)
          form.reset(defaultFormValues)
        }}
        form={form}
        onSubmit={onSubmit}
        isSaving={isSaving}
        error={formError}
        isEdit={Boolean(editingAccount)}
        parentOptions={parentOptions}
      />
    </div>
  )
}
