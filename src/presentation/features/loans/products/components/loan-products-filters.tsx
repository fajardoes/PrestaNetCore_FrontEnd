import { ListFiltersBar, type StatusFilterValue } from '@/presentation/share/components/list-filters-bar'

interface LoanProductsFiltersProps {
  search: string
  status: StatusFilterValue
  onSearchChange: (value: string) => void
  onStatusChange: (value: StatusFilterValue) => void
  onSearch: () => void
  onCreate: () => void
}

export const LoanProductsFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onSearch,
  onCreate,
}: LoanProductsFiltersProps) => {
  return (
    <ListFiltersBar
      search={search}
      onSearchChange={onSearchChange}
      placeholder="Buscar por código o nombre..."
      status={status}
      onStatusChange={onStatusChange}
      actions={
        <>
          <button
            type="button"
            className="btn-secondary btn-list-action"
            onClick={onSearch}
          >
            Buscar
          </button>
          <button
            type="button"
            className="btn-primary btn-list-action"
            onClick={onCreate}
          >
            Nuevo producto
          </button>
        </>
      }
    />
  )
}
