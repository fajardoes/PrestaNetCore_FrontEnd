import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import type { HolidayFormValues } from '@/infrastructure/validations/organization/holiday.schema'
import type { HolidayListItemDto } from '@/infrastructure/interfaces/organization/holidays/holiday-list-item.dto'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import type { StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { HolidaysTable } from '@/presentation/features/organization/components/holidays-table'
import { HolidayModal } from '@/presentation/features/organization/components/holiday-modal'
import { BusinessCalendarUtilities } from '@/presentation/features/organization/components/business-calendar-utilities'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { useHolidays } from '@/presentation/features/organization/hooks/use-holidays'
import { useHolidayTypes } from '@/presentation/features/organization/hooks/use-holiday-types'
import { useSaveHoliday } from '@/presentation/features/organization/hooks/use-save-holiday'
import { useToggleHolidayStatus } from '@/presentation/features/organization/hooks/use-toggle-holiday-status'
import { useBusinessCalendar } from '@/presentation/features/organization/hooks/use-business-calendar'

const PAGE_SIZE = 10

export const HolidaysPage = () => {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const isAdmin =
    user?.roles.some((role) => role.toLowerCase() === 'admin') ?? false

  const { holidays, isLoading, error, refresh } = useHolidays({ enabled: isAdmin })
  const {
    holidayTypes,
    isLoading: holidayTypesLoading,
    error: holidayTypesError,
    refresh: refreshHolidayTypes,
  } = useHolidayTypes({ enabled: isAdmin })
  const { create, update, isSaving, error: saveError, clearError } = useSaveHoliday()
  const { toggleStatus, isLoading: isToggling, error: toggleError, clearError: clearToggleError } =
    useToggleHolidayStatus()
  const calendar = useBusinessCalendar()

  const [activeTab, setActiveTab] = useState<'holidays' | 'utilities'>('holidays')
  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayListItemDto | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmHoliday, setConfirmHoliday] = useState<HolidayListItemDto | null>(null)

  const visibleHolidays = useMemo(() => {
    if (status === 'all') return holidays
    return holidays.filter((holiday) => (status === 'active' ? holiday.isActive : !holiday.isActive))
  }, [holidays, status])

  const filteredHolidays = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return visibleHolidays
    return visibleHolidays.filter((holiday) => {
      return (
        holiday.name.toLowerCase().includes(term) ||
        holiday.holidayTypeName.toLowerCase().includes(term) ||
        holiday.holidayTypeCode.toLowerCase().includes(term) ||
        String(holiday.holidayTypeId).toLowerCase().includes(term) ||
        holiday.date.toLowerCase().includes(term)
      )
    })
  }, [visibleHolidays, query])

  const totalPages = Math.max(1, Math.ceil(filteredHolidays.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paginatedHolidays = useMemo(
    () =>
      filteredHolidays.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [currentPage, filteredHolidays],
  )

  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden administrar feriados.
        </p>
      </div>
    )
  }

  const handleSubmit = async (values: HolidayFormValues) => {
    clearError()
    const payload = {
      date: values.date,
      name: values.name.trim(),
      description: values.description?.trim() || null,
      holidayTypeId: values.holidayTypeId,
      isActive: values.isActive,
    }
    if (modalMode === 'edit' && selectedHoliday) {
      const result = await update(selectedHoliday.id, payload)
      if (result.success) {
        notify('Feriado actualizado correctamente.', 'success')
        setSelectedHoliday(null)
        setIsModalOpen(false)
        await refresh()
      }
      return
    }

    const result = await create(payload)
    if (result.success) {
      notify('Feriado creado correctamente.', 'success')
      setSelectedHoliday(null)
      setIsModalOpen(false)
      await refresh()
    }
  }

  const handleToggleStatus = async () => {
    if (!confirmHoliday) return
    clearToggleError()
    const result = await toggleStatus(confirmHoliday.id, !confirmHoliday.isActive)
    if (result.success) {
      notify('Estado actualizado correctamente.', 'success')
      setConfirmHoliday(null)
      await refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Calendario de Feriados
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Administra fechas no hábiles y consulta utilidades del calendario de negocio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'holidays'
              ? 'bg-primary text-white shadow'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
          }`}
          onClick={() => setActiveTab('holidays')}
        >
          Feriados
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === 'utilities'
              ? 'bg-primary text-white shadow'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
          }`}
          onClick={() => setActiveTab('utilities')}
        >
          Utilidades
        </button>
      </div>

      {activeTab === 'holidays' ? (
        <div className="space-y-4">
          <ListFiltersBar
            search={query}
            onSearchChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            placeholder="Buscar por nombre, fecha o tipo..."
            status={status}
            onStatusChange={(value) => {
              setStatus(value)
              setPage(1)
            }}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  onClick={() => {
                    void refresh()
                    void refreshHolidayTypes()
                  }}
                  disabled={isLoading || holidayTypesLoading}
                >
                  Refrescar
                </button>
                <button
                  type="button"
                  className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => {
                    clearError()
                    setModalMode('create')
                    setSelectedHoliday(null)
                    setIsModalOpen(true)
                  }}
                  disabled={holidayTypesLoading}
                >
                  Crear feriado
                </button>
              </div>
            }
          />

          {holidayTypesError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200">
              {holidayTypesError}
            </div>
          ) : null}

          {toggleError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {toggleError}
            </div>
          ) : null}

          <HolidaysTable
            holidays={paginatedHolidays}
            isLoading={isLoading}
            error={error}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
            onView={(holiday) => {
              clearError()
              setSelectedHoliday(holiday)
              setModalMode('view')
              setIsModalOpen(true)
            }}
            onEdit={(holiday) => {
              clearError()
              setSelectedHoliday(holiday)
              setModalMode('edit')
              setIsModalOpen(true)
            }}
            onToggleStatus={(holiday) => {
              setConfirmHoliday(holiday)
            }}
          />
        </div>
      ) : (
        <BusinessCalendarUtilities
          isChecking={calendar.isChecking}
          checkError={calendar.checkError}
          checkResult={calendar.checkResult}
          isAdjusting={calendar.isAdjusting}
          adjustError={calendar.adjustError}
          adjustResult={calendar.adjustResult}
          onCheck={async (values) => {
            await calendar.validateBusinessDay({
              date: values.date,
              agencyId: values.agencyId || undefined,
              portfolioTypeId: values.portfolioTypeId || undefined,
            })
          }}
          onAdjust={async (values) => {
            await calendar.adjustDate({
              date: values.date,
              holidayAdjustmentRuleCode: values.holidayAdjustmentRuleCode,
              agencyId: values.agencyId || undefined,
              portfolioTypeId: values.portfolioTypeId || undefined,
            })
          }}
        />
      )}

      <HolidayModal
        open={isModalOpen}
        mode={modalMode}
        holiday={selectedHoliday}
        holidayTypes={holidayTypes}
        holidayTypesLoading={holidayTypesLoading}
        holidayTypesError={holidayTypesError}
        onClose={() => {
          setSelectedHoliday(null)
          setIsModalOpen(false)
          setModalMode('create')
          clearError()
        }}
        onSubmit={handleSubmit}
        isSubmitting={isSaving}
        error={saveError}
      />

      <ConfirmModal
        open={Boolean(confirmHoliday)}
        title={confirmHoliday?.isActive ? 'Desactivar feriado' : 'Activar feriado'}
        description={
          confirmHoliday
            ? `¿Deseas ${confirmHoliday.isActive ? 'desactivar' : 'activar'} el feriado "${confirmHoliday.name}"?`
            : ''
        }
        confirmLabel={confirmHoliday?.isActive ? 'Desactivar' : 'Activar'}
        cancelLabel="Cancelar"
        isProcessing={isToggling}
        onConfirm={handleToggleStatus}
        onCancel={() => setConfirmHoliday(null)}
      />
    </div>
  )
}
