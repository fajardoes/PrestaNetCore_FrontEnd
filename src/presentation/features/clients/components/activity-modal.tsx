import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  activitySchema,
  type ClientActivityFormValues,
} from '@/infrastructure/validations/clients/client.schema'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface ActivityModalProps {
  open: boolean
  initialValues?: ClientActivityFormValues | null
  activitiesCatalog: EconomicActivityCatalog[]
  onClose: () => void
  onSubmit: (values: ClientActivityFormValues) => void
}

export const ActivityModal = ({
  open,
  initialValues,
  activitiesCatalog,
  onClose,
  onSubmit,
}: ActivityModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      actividadId: '',
      nombreEmpresa: '',
      descripcion: '',
      telefono: '',
      ingresosMensuales: 0,
      gastosMensuales: 0,
      lugarActividad: '',
      tiempoActividadMeses: 0,
      esPrincipal: false,
      esNegocio: false,
      activo: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          actividadId: '',
          nombreEmpresa: '',
          descripcion: '',
          telefono: '',
          ingresosMensuales: 0,
          gastosMensuales: 0,
          lugarActividad: '',
          tiempoActividadMeses: 0,
          esPrincipal: false,
          esNegocio: false,
          activo: true,
        },
      )
    }
  }, [initialValues, open, reset])

  const activityId = watch('actividadId')
  const activityOptions: AsyncSelectOption<EconomicActivityCatalog>[] =
    activitiesCatalog.map((activity) => ({
      value: activity.id,
      label: `${activity.nombre}${activity.sectorNombre ? ` (${activity.sectorNombre})` : ''}`,
      meta: activity,
    }))

  const loadActivityOptions = async (inputValue: string) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return activityOptions
    return activityOptions.filter((option) =>
      option.label.toLowerCase().includes(term),
    )
  }

  const submitHandler = handleSubmit((values) => onSubmit(values))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {initialValues ? 'Editar actividad' : 'Agregar actividad'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selecciona actividad, empresa y marca la principal solo una vez.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.stopPropagation()
            submitHandler(event)
          }}
          noValidate
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Actividad económica
              </label>
              <AsyncSelect<EconomicActivityCatalog>
                value={
                  activityOptions.find((option) => option.value === activityId) ??
                  null
                }
                onChange={(option) =>
                  setValue('actividadId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={loadActivityOptions}
                placeholder="Selecciona..."
                inputId="actividadId"
                instanceId="client-actividad-id"
                defaultOptions={activityOptions}
                noOptionsMessage="Sin actividades"
              />
              <input type="hidden" {...register('actividadId')} />
              {errors.actividadId ? (
                <p className="text-xs text-red-500">
                  {errors.actividadId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Nombre de empresa
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('nombreEmpresa')}
              />
              {errors.nombreEmpresa ? (
                <p className="text-xs text-red-500">
                  {errors.nombreEmpresa.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Ingresos mensuales
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('ingresosMensuales', { valueAsNumber: true })}
              />
              {errors.ingresosMensuales ? (
                <p className="text-xs text-red-500">
                  {errors.ingresosMensuales.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Gastos mensuales
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('gastosMensuales', { valueAsNumber: true })}
              />
              {errors.gastosMensuales ? (
                <p className="text-xs text-red-500">
                  {errors.gastosMensuales.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Tiempo de actividad (meses)
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('tiempoActividadMeses', { valueAsNumber: true })}
              />
              {errors.tiempoActividadMeses ? (
                <p className="text-xs text-red-500">
                  {errors.tiempoActividadMeses.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Teléfono (opcional)
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('telefono')}
              />
              {errors.telefono ? (
                <p className="text-xs text-red-500">{errors.telefono.message}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Lugar de actividad (opcional)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('lugarActividad')}
            />
            {errors.lugarActividad ? (
              <p className="text-xs text-red-500">
                {errors.lugarActividad.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Descripción (opcional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('descripcion')}
            />
            {errors.descripcion ? (
              <p className="text-xs text-red-500">{errors.descripcion.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('esNegocio')}
              />
              <span>Es negocio</span>
            </label>

            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('esPrincipal')}
              />
              <span>Actividad principal</span>
            </label>

            <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('activo')}
              />
              <span>Activa</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm shadow"
            >
              {initialValues ? 'Guardar cambios' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
