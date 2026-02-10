import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { BusinessDateSummaryCard } from '@/presentation/features/system-business-date/components/business-date-summary-card'
import { SetBusinessDateModal } from '@/presentation/features/system-business-date/components/set-business-date-modal'
import { SetDayOpenToggle } from '@/presentation/features/system-business-date/components/set-day-open-toggle'

export const SystemBusinessDatePage = () => {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const isAdmin = useMemo(
    () => user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false,
    [user?.roles],
  )

  const { state, isLoading, error, updateBusinessDate, setDayOpen } =
    useBusinessDate()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleBusinessDateSubmit = async (date: string) => {
    const success = await updateBusinessDate(date)
    if (success) {
      notify('Fecha operativa actualizada correctamente.', 'success')
      setIsModalOpen(false)
    } else {
      notify('No fue posible actualizar la fecha operativa.', 'error')
    }
  }

  const handleDayStatusChange = async (next: boolean) => {
    const success = await setDayOpen(next)
    if (success) {
      notify(
        next ? 'Día abierto correctamente.' : 'Día cerrado correctamente.',
        'success',
      )
    } else {
      notify('No fue posible actualizar el estado del día.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Fecha Operativa
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consulta la fecha operativa vigente y el estado del día en el sistema.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <BusinessDateSummaryCard state={state} isLoading={isLoading} />

      {isAdmin ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Acciones administrativas
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Cambia la fecha operativa o ajusta el estado del día.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
              >
                Cambiar fecha operativa
              </button>
            </div>
          </div>

          <SetDayOpenToggle
            isDayOpen={state?.isDayOpen ?? false}
            isLoading={isLoading}
            onChange={handleDayStatusChange}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
          <p className="font-semibold">Acceso restringido</p>
          <p className="text-sm">
            Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
            pueden cambiar la fecha operativa o abrir/cerrar el día.
          </p>
        </div>
      )}

      <SetBusinessDateModal
        open={isModalOpen}
        initialDate={state?.businessDate ?? null}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBusinessDateSubmit}
        isSubmitting={isLoading}
        error={error}
      />
    </div>
  )
}
