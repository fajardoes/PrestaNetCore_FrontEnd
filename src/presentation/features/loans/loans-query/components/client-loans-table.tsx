import { Link } from 'react-router-dom'
import type { LoanListItemResponse } from '@/infrastructure/loans/responses/loan-list-response'
import {
  formatCurrency,
  formatDate,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface ClientLoansTableProps {
  loans: LoanListItemResponse[]
  page: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  isLoading: boolean
  error: string | null
  detailNavigationState?: unknown
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export const ClientLoansTable = ({
  loans,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isLoading,
  error,
  detailNavigationState,
}: ClientLoansTableProps) => (
  <TableContainer mode="legacy-compact" variant="strong">
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Estado</th>
            <th className="text-right">Capital</th>
            <th className="text-right">Saldo</th>
            <th className="text-right">Pagado</th>
            <th>Creación</th>
            <th>Primera cuota</th>
            <th>Vencimiento</th>
            <th className="text-right">Cuotas</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={11} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                Cargando préstamos...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={11} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                {error}
              </td>
            </tr>
          ) : !loans.length ? (
            <tr>
              <td colSpan={11} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                El cliente no tiene préstamos registrados.
              </td>
            </tr>
          ) : (
            loans.map((loan) => (
              <tr key={loan.id}>
                <td className="font-medium text-slate-800 dark:text-slate-100">
                  {loan.loanNo?.trim() || loan.id}
                </td>
                <td>{loan.loanProductName?.trim() || '—'}</td>
                <td>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(loan.statusCode)}`}>
                    {translateLoanApplicationStatus(loan.statusCode, loan.statusName)}
                  </span>
                </td>
                <td className="text-right">{formatCurrency(loan.principal)}</td>
                <td className="text-right">{formatCurrency(loan.totalOutstanding)}</td>
                <td className="text-right">{formatCurrency(loan.totalPaid)}</td>
                <td>{formatDate(loan.createdOperationalDate)}</td>
                <td>{formatDate(loan.firstDueDate)}</td>
                <td>{formatDate(loan.maturityDate)}</td>
                <td className="text-right">{loan.installmentsCount ?? '—'}</td>
                <td className="text-right">
                  <Link
                    to={`/loans/${loan.id}`}
                    state={detailNavigationState}
                    className="btn-table-action inline-flex px-2"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
    <TablePagination
      page={page}
      totalPages={Math.max(1, totalPages)}
      onPageChange={onPageChange}
      pageSize={pageSize}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      onPageSizeChange={onPageSizeChange}
    />
  </TableContainer>
)
