import type { ReactNode } from 'react'

interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label?: ReactNode
  pageSize?: number
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  pageSizeLabel?: string
  disabled?: boolean
}

export const TablePagination = ({
  page,
  totalPages,
  onPageChange,
  label = 'Página',
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  pageSizeLabel = 'Tamaño página:',
  disabled = false,
}: TablePaginationProps) => {
  const showPageSize =
    typeof pageSize === 'number' &&
    Array.isArray(pageSizeOptions) &&
    pageSizeOptions.length > 0 &&
    typeof onPageSizeChange === 'function'

  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="flex items-center gap-3">
        {showPageSize ? (
          <label className="flex items-center gap-2 text-sm">
            <span>{pageSizeLabel}</span>
            <select
              value={pageSize}
              disabled={disabled}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span>
          {label} {page} de {totalPages}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page === 1}
          className={`btn-icon-label border px-3 py-2 ${
            disabled || page === 1
              ? 'cursor-not-allowed opacity-50'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page === totalPages}
          className={`btn-icon-label border px-3 py-2 ${
            disabled || page === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'border-slate-300 dark:border-slate-700'
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
