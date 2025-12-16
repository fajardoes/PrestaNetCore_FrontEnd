interface TablePaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label?: string
}

export const TablePagination = ({
  page,
  totalPages,
  onPageChange,
  label = 'Página',
}: TablePaginationProps) => {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <span>
        {label} {page} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          className={`btn-icon-label border px-3 py-2 ${
            page === 1
              ? 'cursor-not-allowed opacity-50'
              : 'border-slate-300 dark:border-slate-700'
          }`}
          disabled={page === 1}
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          className={`btn-icon-label border px-3 py-2 ${
            page === totalPages
              ? 'cursor-not-allowed opacity-50'
              : 'border-slate-300 dark:border-slate-700'
          }`}
          disabled={page === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
