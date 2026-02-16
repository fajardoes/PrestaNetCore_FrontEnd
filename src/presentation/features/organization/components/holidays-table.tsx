import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface HolidaysTableProps {
  holidays: HolidayListItemDto[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onView: (holiday: HolidayListItemDto) => void
  onEdit: (holiday: HolidayListItemDto) => void
  onToggleStatus: (holiday: HolidayListItemDto) => void
}

const formatDate = (value: string) => value
const getHolidayTypeLabel = (holiday: HolidayListItemDto) =>
  holiday.holidayTypeName || holiday.holidayTypeCode || `Tipo ${holiday.holidayTypeId}`

export const HolidaysTable = ({
  holidays,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
  onView,
  onEdit,
  onToggleStatus,
}: HolidaysTableProps) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando feriados...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
        {error}
      </div>
    )
  }

  if (!holidays.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        No hay feriados registrados.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <TableContainer mode="legacy-compact" className="rounded-md">
        <table className="w-full table-auto text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {holidays.map((holiday) => (
              <tr key={holiday.id} className={!holiday.isActive ? 'bg-red-50/50 dark:bg-red-500/10' : ''}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(holiday.date)}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {holiday.name}
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                  {getHolidayTypeLabel(holiday)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      holiday.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
                    }`}
                  >
                    {holiday.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onView(holiday)}
                    >
                      Ver
                    </button>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => onEdit(holiday)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`btn-table-action ${
                        holiday.isActive
                          ? 'border border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/50 dark:text-amber-200 dark:hover:bg-amber-500/10'
                          : 'border border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-500/50 dark:text-emerald-200 dark:hover:bg-emerald-500/10'
                      }`}
                      onClick={() => onToggleStatus(holiday)}
                    >
                      {holiday.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableContainer>
      <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
