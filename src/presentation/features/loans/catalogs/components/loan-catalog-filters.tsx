import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import type { ReactNode } from 'react'

interface LoanCatalogFiltersProps {
  search: string
  status: StatusFilterValue
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilterValue) => void
  actions?: ReactNode
}

export const LoanCatalogFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  actions,
}: LoanCatalogFiltersProps) => {
  return (
    <ListFiltersBar
      search={search}
      onSearchChange={onSearchChange}
      placeholder="Buscar por código o nombre..."
      status={status}
      onStatusChange={onStatusChange}
      actions={actions}
    />
  )
}
