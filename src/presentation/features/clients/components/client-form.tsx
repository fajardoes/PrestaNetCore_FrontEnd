import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'
import type { ClientActivity, ClientReference } from '@/infrastructure/interfaces/clients/client'
import { mapGeneroCatalogToEnum, mapGeneroEnumToOption } from '@/core/helpers/genero-mapper'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import {
  clientSchema,
  type ClientFormValues,
  type ClientActivityFormValues,
} from '@/infrastructure/validations/clients/client.schema'
import { ReferenceModal } from '@/presentation/features/clients/components/reference-modal'
import { ActivityModal } from '@/presentation/features/clients/components/activity-modal'

interface ClientFormProps {
  initialValues?: Partial<ClientFormValues>
  onSubmit: (values: ClientFormValues) => Promise<void> | void
  onCancel: () => void
  isSaving?: boolean
  error?: string | null
  catalogs: {
    sectors: ClientCatalogItem[]
    civilStatus: ClientCatalogItem[]
    genders: ClientCatalogItem[]
    professions: ClientCatalogItem[]
    dependents: ClientCatalogItem[]
    housingTypes: ClientCatalogItem[]
    municipalities: ClientCatalogItem[]
    activities: EconomicActivityCatalog[]
    activitiesBySector: Record<string, EconomicActivityCatalog[]>
  }
}

const toSafeDateInput = (value?: string | null) => {
  if (!value) return ''
  return value.slice(0, 10)
}

export const ClientForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  error,
  catalogs,
}: ClientFormProps) => {
  const [isReferenceModalOpen, setIsReferenceModalOpen] = useState(false)
  const [editingReferenceIndex, setEditingReferenceIndex] = useState<number | null>(null)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null)
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nombreCompleto: '',
      identidad: '',
      rtn: '',
      direccion: '',
      telefono: '',
      genero: '',
      estadoCivilId: '',
      profesionId: '',
      fechaNacimiento: '',
      municipioId: '',
      esEmpleado: false,
      tiempoResidirMeses: 0,
      dependientesId: '',
      tipoViviendaId: '',
      referencias: [],
      actividades: [],
    },
  })

  const {
    append: addReference,
    update: updateReference,
  } = useFieldArray({
    control,
    name: 'referencias',
  })

  const {
    append: addActivity,
    update: updateActivity,
  } = useFieldArray({
    control,
    name: 'actividades',
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        ...initialValues,
        genero: mapGeneroEnumToOption(initialValues.genero),
        fechaNacimiento: toSafeDateInput(initialValues.fechaNacimiento),
        referencias: (initialValues.referencias ?? []).map((reference) => ({
          ...reference,
          direccion: reference.direccion ?? '',
          lugarTrabajo: reference.lugarTrabajo ?? '',
          activo: reference.activo ?? true,
        })),
        actividades: (initialValues.actividades ?? []).map((activity) => ({
          ...activity,
          descripcion: activity.descripcion ?? '',
          nombreEmpresa: activity.nombreEmpresa ?? '',
          telefono: activity.telefono ?? '',
          lugarActividad: activity.lugarActividad ?? '',
          activo: activity.activo ?? true,
        })),
      })
    }
  }, [initialValues, reset])

  const activities = watch('actividades')
  const references = watch('referencias')

  const openNewReferenceModal = () => {
    setEditingReferenceIndex(null)
    setIsReferenceModalOpen(true)
  }

  const openEditReferenceModal = (index: number) => {
    setEditingReferenceIndex(index)
    setIsReferenceModalOpen(true)
  }

  const handleSaveReference = (values: ClientReference) => {
    const referenceWithDefaults = {
      ...values,
      activo: values.activo ?? true,
    }
    if (editingReferenceIndex === null) {
      addReference(referenceWithDefaults)
    } else {
      updateReference(editingReferenceIndex, referenceWithDefaults)
    }
    setIsReferenceModalOpen(false)
  }

  const handleDeleteReference = (index: number) => {
    const current = getValues('referencias')
    const updated = current.map((ref, idx) =>
      idx === index ? { ...ref, activo: false } : ref,
    )
    setValue('referencias', updated)
  }

  const openNewActivityModal = () => {
    setEditingActivityIndex(null)
    setIsActivityModalOpen(true)
  }

  const openEditActivityModal = (index: number) => {
    setEditingActivityIndex(index)
    setIsActivityModalOpen(true)
  }

  const ensureSinglePrincipal = (next: ClientActivity, index?: number) => {
    if (!next.esPrincipal) return
    const currentActivities = getValues('actividades')
    currentActivities.forEach((activity, idx) => {
      if (idx !== index && activity.esPrincipal) {
        updateActivity(idx, { ...activity, esPrincipal: false })
      }
    })
  }

  const handleSaveActivity = (values: ClientActivityFormValues) => {
    const normalizedValues = {
      ...values,
      sectorId: values.sectorId ?? undefined,
    }
    ensureSinglePrincipal(normalizedValues, editingActivityIndex ?? undefined)
    const activityWithDefaults = {
      ...normalizedValues,
      activo: normalizedValues.activo ?? true,
    }
    if (editingActivityIndex === null) {
      addActivity(activityWithDefaults)
    } else {
      updateActivity(editingActivityIndex, activityWithDefaults)
    }
    setIsActivityModalOpen(false)
  }

  const handleDeleteActivity = (index: number) => {
    const current = getValues('actividades')
    const updated = current.map((activity, idx) =>
      idx === index ? { ...activity, activo: false } : activity,
    )
    setValue('actividades', updated)
  }

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <>
      <form className="space-y-6" onSubmit={submitHandler} noValidate>
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="nombreCompleto"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Nombre completo
          </label>
          <input
            id="nombreCompleto"
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('nombreCompleto')}
            disabled={isSaving}
          />
          {errors.nombreCompleto ? (
            <p className="text-xs text-red-500">
              {errors.nombreCompleto.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="identidad"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Identidad (13 dígitos)
          </label>
          <input
            id="identidad"
            type="text"
            maxLength={13}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('identidad')}
            disabled={isSaving}
          />
          {errors.identidad ? (
            <p className="text-xs text-red-500">{errors.identidad.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="rtn"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            RTN (opcional)
          </label>
          <input
            id="rtn"
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('rtn')}
            disabled={isSaving}
          />
          {errors.rtn ? (
            <p className="text-xs text-red-500">{errors.rtn.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="telefono"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Teléfono
          </label>
          <input
            id="telefono"
            type="text"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('telefono')}
            disabled={isSaving}
          />
          {errors.telefono ? (
            <p className="text-xs text-red-500">{errors.telefono.message}</p>
          ) : null}
        </div>

        <div className="md:col-span-2 space-y-2">
          <label
            htmlFor="direccion"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Dirección
          </label>
          <textarea
            id="direccion"
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('direccion')}
            disabled={isSaving}
          />
          {errors.direccion ? (
            <p className="text-xs text-red-500">{errors.direccion.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="genero"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Género
          </label>
          <select
            id="genero"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('genero')}
            disabled={isSaving}
          >
            <option value="">Selecciona...</option>
            {catalogs.genders.map((gender) => (
              <option
                key={gender.id}
                value={mapGeneroCatalogToEnum(gender).toString()}
              >
                {gender.nombre}
              </option>
            ))}
          </select>
          {errors.genero ? (
            <p className="text-xs text-red-500">{errors.genero.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="estadoCivilId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Estado civil
          </label>
          <select
            id="estadoCivilId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('estadoCivilId')}
            disabled={isSaving}
          >
            <option value="">Selecciona...</option>
            {catalogs.civilStatus.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
          {errors.estadoCivilId ? (
            <p className="text-xs text-red-500">
              {errors.estadoCivilId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="profesionId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Profesión
          </label>
          <select
            id="profesionId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('profesionId')}
            disabled={isSaving}
          >
            <option value="">Selecciona...</option>
            {catalogs.professions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
          {errors.profesionId ? (
            <p className="text-xs text-red-500">
              {errors.profesionId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="fechaNacimiento"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Fecha de nacimiento
          </label>
          <input
            id="fechaNacimiento"
            type="date"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('fechaNacimiento')}
            disabled={isSaving}
          />
          {errors.fechaNacimiento ? (
            <p className="text-xs text-red-500">
              {errors.fechaNacimiento.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="municipioId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Municipio
          </label>
          <select
            id="municipioId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('municipioId')}
            disabled={isSaving}
          >
            <option value="">Selecciona...</option>
            {catalogs.municipalities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
          {errors.municipioId ? (
            <p className="text-xs text-red-500">
              {errors.municipioId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="dependientesId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Dependientes
          </label>
          <select
            id="dependientesId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('dependientesId')}
            disabled={isSaving}
          >
            <option value="">Selecciona...</option>
            {catalogs.dependents.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
          {errors.dependientesId ? (
            <p className="text-xs text-red-500">
              {errors.dependientesId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tipoViviendaId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Tipo de vivienda
          </label>
          <select
            id="tipoViviendaId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('tipoViviendaId')}
            disabled={isSaving}
          >
            <option value="">Selecciona...</option>
            {catalogs.housingTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>
          {errors.tipoViviendaId ? (
            <p className="text-xs text-red-500">
              {errors.tipoViviendaId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="tiempoResidirMeses"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Tiempo de residencia (meses)
          </label>
          <input
            id="tiempoResidirMeses"
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('tiempoResidirMeses', { valueAsNumber: true })}
            disabled={isSaving}
          />
          {errors.tiempoResidirMeses ? (
            <p className="text-xs text-red-500">
              {errors.tiempoResidirMeses.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              ¿Es empleado?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Marca si el cliente es empleado de una organización.
            </p>
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
              {...register('esEmpleado')}
              disabled={isSaving}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              Sí
            </span>
          </label>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Referencias personales
            </h3>
          </div>
          <button
            type="button"
            onClick={openNewReferenceModal}
            className="btn-primary px-3 py-2 text-xs shadow"
            disabled={isSaving}
          >
            Agregar referencia
          </button>
        </div>

        {!references.length ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Agrega al menos una referencia con teléfono.
          </p>
        ) : null}

        <div className="space-y-2">
          {references.map((reference, index) => (
            <div
              key={`${reference.id ?? index}-${reference.nombreCompleto}`}
              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {reference.nombreCompleto}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {reference.parentesco} · {reference.telefono}
                  </p>
                  {reference.direccion ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {reference.direccion}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                    reference.activo !== false
                      ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-50 dark:ring-emerald-500/40'
                      : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                  }`}
                >
                  {reference.activo !== false ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-icon-label text-xs"
                  onClick={() => openEditReferenceModal(index)}
                  disabled={isSaving}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-icon-label text-xs"
                  onClick={() => {
                    const toggled = [...references]
                    toggled[index] = {
                      ...toggled[index],
                      activo: toggled[index].activo === false,
                    }
                    setValue('referencias', toggled)
                  }}
                  disabled={isSaving}
                >
                  {reference.activo === false ? 'Activar' : 'Desactivar'}
                </button>
                <button
                  type="button"
                  className="btn-icon-label text-xs text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                  onClick={() => handleDeleteReference(index)}
                  disabled={isSaving}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Actividades económicas
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Una sola actividad principal activa por cliente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openNewActivityModal}
              className="btn-primary px-3 py-2 text-xs shadow self-start"
              disabled={isSaving}
            >
              Agregar actividad
            </button>
          </div>
        </div>

        {!activities.length ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Relaciona al menos una actividad para calcular ingresos/gastos.
          </p>
        ) : null}

        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div
              key={`${activity.id ?? index}-${activity.actividadId}`}
              className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {activity.nombreEmpresa}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {catalogs.activities.find((a) => a.id === activity.actividadId)?.nombre ??
                      'Actividad'}{' '}
                    {catalogs.activities.find((a) => a.id === activity.actividadId)?.sectorNombre ? `· ${catalogs.activities.find((a) => a.id === activity.actividadId)?.sectorNombre}` : ''}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ingresos: {activity.ingresosMensuales} · Gastos: {activity.gastosMensuales}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activity.esPrincipal ? (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/40 dark:bg-primary/20 dark:text-primary-foreground">
                      Principal
                    </span>
                  ) : null}
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                      activity.activo !== false
                        ? 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-50 dark:ring-emerald-500/40'
                        : 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
                    }`}
                  >
                    {activity.activo !== false ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-icon-label text-xs"
                  onClick={() => openEditActivityModal(index)}
                  disabled={isSaving}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-icon-label text-xs"
                  onClick={() => {
                    const toggled = [...activities]
                    toggled[index] = {
                      ...toggled[index],
                      activo: toggled[index].activo === false,
                    }
                    setValue('actividades', toggled)
                  }}
                  disabled={isSaving}
                >
                  {activity.activo === false ? 'Activar' : 'Desactivar'}
                </button>
                <button
                  type="button"
                  className="btn-icon-label text-xs"
                  onClick={() => {
                    const toggled = [...activities]
                    toggled[index] = {
                      ...toggled[index],
                      esPrincipal: !toggled[index].esPrincipal,
                      activo: toggled[index].activo !== false,
                    }
                    const normalized = {
                      ...toggled[index],
                      sectorId: toggled[index].sectorId ?? undefined,
                    }
                    ensureSinglePrincipal(normalized, index)
                    setValue('actividades', toggled)
                  }}
                  disabled={isSaving}
                >
                  {activity.esPrincipal ? 'Quitar principal' : 'Marcar principal'}
                </button>
                <button
                  type="button"
                  className="btn-icon-label text-xs text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                  onClick={() => handleDeleteActivity(index)}
                  disabled={isSaving}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar cliente'}
        </button>
      </div>

    </form>

    <ReferenceModal
      open={isReferenceModalOpen}
      initialValues={
        editingReferenceIndex !== null ? references[editingReferenceIndex] : null
      }
      onClose={() => setIsReferenceModalOpen(false)}
      onSubmit={handleSaveReference}
    />

    <ActivityModal
      open={isActivityModalOpen}
      initialValues={
        editingActivityIndex !== null ? activities[editingActivityIndex] : null
      }
      onClose={() => setIsActivityModalOpen(false)}
      onSubmit={handleSaveActivity}
      activitiesCatalog={catalogs.activities}
    />
    </>
  )
}
