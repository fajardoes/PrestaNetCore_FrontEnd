import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  referenceSchema,
  type ClientReferenceFormValues,
} from '@/infrastructure/validations/clients/client.schema'

interface ReferenceModalProps {
  open: boolean
  initialValues?: ClientReferenceFormValues | null
  onClose: () => void
  onSubmit: (values: ClientReferenceFormValues) => void
}

export const ReferenceModal = ({
  open,
  initialValues,
  onClose,
  onSubmit,
}: ReferenceModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientReferenceFormValues>({
    resolver: zodResolver(referenceSchema),
    defaultValues: {
      nombreCompleto: '',
      telefono: '',
      parentesco: '',
      address: '',
      lugarTrabajo: '',
      activo: true,
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        initialValues ?? {
          nombreCompleto: '',
          telefono: '',
          parentesco: '',
          address: '',
          lugarTrabajo: '',
          activo: true,
        },
      )
    }
  }, [initialValues, open, reset])

  const submitHandler = handleSubmit((values) => onSubmit(values))

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              {initialValues ? 'Editar referencia' : 'Agregar referencia'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nombre, teléfono y parentesco son obligatorios.
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Nombre completo
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('nombreCompleto')}
            />
            {errors.nombreCompleto ? (
              <p className="text-xs text-red-500">
                {errors.nombreCompleto.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Teléfono
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('telefono')}
              />
              {errors.telefono ? (
                <p className="text-xs text-red-500">{errors.telefono.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Parentesco
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...register('parentesco')}
              />
              {errors.parentesco ? (
                <p className="text-xs text-red-500">
                  {errors.parentesco.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Dirección (opcional)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('address')}
            />
            {errors.address ? (
              <p className="text-xs text-red-500">{errors.address.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Lugar de trabajo (opcional)
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('lugarTrabajo')}
            />
            {errors.lugarTrabajo ? (
              <p className="text-xs text-red-500">
                {errors.lugarTrabajo.message}
              </p>
            ) : null}
          </div>

          <label className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
              {...register('activo')}
            />
            <span>Activa</span>
          </label>

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
