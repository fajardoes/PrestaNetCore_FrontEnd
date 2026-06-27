import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'

const PAGE_SIZE = 10

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
  const columns = [
    {
      key: 'date',
      header: 'Fecha',
      className: 'min-w-[120px]',
      render: (holiday: HolidayListItemDto) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {formatDate(holiday.date)}
        </span>
      ),
      getTitle: (holiday: HolidayListItemDto) => formatDate(holiday.date),
    },
    {
      key: 'name',
      header: 'Nombre',
      className: 'min-w-[240px]',
      render: (holiday: HolidayListItemDto) => holiday.name,
      getTitle: (holiday: HolidayListItemDto) => holiday.name,
    },
    {
      key: 'type',
      header: 'Tipo',
      className: 'min-w-[180px]',
      render: (holiday: HolidayListItemDto) => getHolidayTypeLabel(holiday),
      getTitle: (holiday: HolidayListItemDto) => getHolidayTypeLabel(holiday),
    },
    {
      key: 'active',
      header: 'Activo',
      render: (holiday: HolidayListItemDto) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
            holiday.isActive
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'
          }`}
        >
          {holiday.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
      getTitle: (holiday: HolidayListItemDto) =>
        holiday.isActive ? 'Activo' : 'Inactivo',
    },
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[250px]',
      render: (holiday: HolidayListItemDto) => (
        <span className="flex justify-end gap-2">
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
                : 'border border-sky-300 text-sky-700 hover:bg-sky-50 dark:border-sky-500/50 dark:text-sky-200 dark:hover:bg-sky-500/10'
            }`}
            onClick={() => onToggleStatus(holiday)}
          >
            {holiday.isActive ? 'Desactivar' : 'Activar'}
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
        title="Listado de feriados"
        columns={columns}
        rows={holidays}
        rowKey={(holiday) => holiday.id}
        isLoading={isLoading}
        loadingMessage="Cargando feriados..."
        emptyMessage={error ? 'No fue posible cargar los feriados.' : 'No hay feriados registrados.'}
        maxHeightClassName="max-h-[640px]"
        rowNumberStart={(page - 1) * PAGE_SIZE + 1}
      />

      <TablePagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
