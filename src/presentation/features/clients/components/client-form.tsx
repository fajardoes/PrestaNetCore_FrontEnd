import { useEffect, useMemo, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'
import type { ClientActivity, ClientReference } from '@/infrastructure/interfaces/clients/client'
import type { EconomicActivityCatalog } from '@/infrastructure/interfaces/clients/catalog'
import type {
  Department,
  Municipality,
} from '@/infrastructure/interfaces/organization/geography'
import {
  clientSchema,
  type ClientFormValues,
  type ClientActivityFormValues,
} from '@/infrastructure/validations/clients/client.schema'
import { ReferenceModal } from '@/presentation/features/clients/components/reference-modal'
import { ActivityModal } from '@/presentation/features/clients/components/activity-modal'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'

interface ClientFormProps {
  initialValues?: Partial<ClientFormValues>
  onSubmit: (values: ClientFormValues) => Promise<void> | void
  onCancel: () => void
  isSaving?: boolean
  error?: string | null
  isEdit?: boolean
  catalogs: {
    sectors: ClientCatalogItem[]
    civilStatus: ClientCatalogItem[]
    genders: ClientCatalogItem[]
    professions: ClientCatalogItem[]
    dependents: ClientCatalogItem[]
    housingTypes: ClientCatalogItem[]
    departments: Department[]
    municipalities: Municipality[]
    activities: EconomicActivityCatalog[]
    activitiesBySector: Record<string, EconomicActivityCatalog[]>
  }
}

const toSafeDateInput = (value?: string | null) => {
  if (!value) return ''
  return value.slice(0, 10)
}

const filterOptions = <TMeta,>(
  options: AsyncSelectOption<TMeta>[],
  inputValue: string,
) => {
  const term = inputValue.trim().toLowerCase()
  if (!term) return options
  return options.filter((option) => option.label.toLowerCase().includes(term))
}

export const ClientForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  error,
  isEdit,
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
      address: '',
      telefono: '',
      generoId: '',
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
        generoId: initialValues.generoId ?? '',
        fechaNacimiento: toSafeDateInput(initialValues.fechaNacimiento),
        referencias: (initialValues.referencias ?? []).map((reference) => ({
          ...reference,
          address: reference.address ?? '',
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

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')
  const municipalityId = watch('municipioId')

  useEffect(() => {
    if (initialValues?.municipioId && catalogs.municipalities.length) {
      const currentMunicipality = catalogs.municipalities.find(
        (item) => item.id === initialValues.municipioId,
      )
      if (currentMunicipality) {
        setSelectedDepartmentId(currentMunicipality.departmentId)
        return
      }
    }
    if (!initialValues?.municipioId) {
      setSelectedDepartmentId('')
    }
  }, [catalogs.municipalities, initialValues?.municipioId])

  useEffect(() => {
    if (!municipalityId) return
    const current = catalogs.municipalities.find(
      (item) => item.id === municipalityId,
    )
    if (current && current.departmentId !== selectedDepartmentId) {
      setSelectedDepartmentId(current.departmentId)
    }
  }, [catalogs.municipalities, municipalityId, selectedDepartmentId])

  const activities = watch('actividades')
  const references = watch('referencias')

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId)
    const currentMunicipalityId = getValues('municipioId')
    const belongsToDepartment = catalogs.municipalities.some(
      (municipality) =>
        municipality.id === currentMunicipalityId &&
        municipality.departmentId === departmentId,
    )
    if (currentMunicipalityId && !belongsToDepartment) {
      setValue('municipioId', '')
    }
  }

  const sortedDepartments = useMemo(
    () =>
      [...catalogs.departments].sort((a, b) =>
        a.name.localeCompare(b.name, 'es'),
      ),
    [catalogs.departments],
  )

  const municipalityOptions = useMemo(() => {
    const options = catalogs.municipalities.filter((municipality) => {
      const matchesDepartment = selectedDepartmentId
        ? municipality.departmentId === selectedDepartmentId
        : true
      const isActiveOrSelected =
        municipality.activo || municipality.id === municipalityId
      return matchesDepartment && isActiveOrSelected
    })
    return options.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [catalogs.municipalities, municipalityId, selectedDepartmentId])

  const generoId = watch('generoId')
  const estadoCivilId = watch('estadoCivilId')
  const profesionId = watch('profesionId')
  const fechaNacimiento = watch('fechaNacimiento')
  const dependientesId = watch('dependientesId')
  const tipoViviendaId = watch('tipoViviendaId')

  const genderOptions = useMemo(
    () =>
      catalogs.genders.map((gender) => ({
        value: gender.id,
        label: gender.nombre,
        meta: gender,
      })),
    [catalogs.genders],
  )
  const civilStatusOptions = useMemo(
    () =>
      catalogs.civilStatus.map((item) => ({
        value: item.id,
        label: item.nombre,
        meta: item,
      })),
    [catalogs.civilStatus],
  )
  const professionOptions = useMemo(
    () =>
      catalogs.professions.map((item) => ({
        value: item.id,
        label: item.nombre,
        meta: item,
      })),
    [catalogs.professions],
  )
  const dependentOptions = useMemo(
    () =>
      catalogs.dependents.map((item) => ({
        value: item.id,
        label: item.nombre,
        meta: item,
      })),
    [catalogs.dependents],
  )
  const housingTypeOptions = useMemo(
    () =>
      catalogs.housingTypes.map((item) => ({
        value: item.id,
        label: item.nombre,
        meta: item,
      })),
    [catalogs.housingTypes],
  )
  const departmentOptions = useMemo(
    () =>
      sortedDepartments.map((department) => ({
        value: department.id,
        label: department.name,
        meta: department,
      })),
    [sortedDepartments],
  )
  const municipalityAsyncOptions = useMemo(
    () =>
      municipalityOptions.map((item) => ({
        value: item.id,
        label: `${item.name} · ${item.departmentName}`,
        meta: item,
      })),
    [municipalityOptions],
  )

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
    if (isEdit) {
      const updated = current.map((ref, idx) =>
        idx === index ? { ...ref, activo: false } : ref,
      )
      setValue('referencias', updated)
      return
    }
    const updated = current.filter((_, idx) => idx !== index)
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
    if (isEdit) {
      const updated = current.map((activity, idx) =>
        idx === index ? { ...activity, activo: false } : activity,
      )
      setValue('actividades', updated)
      return
    }
    const updated = current.filter((_, idx) => idx !== index)
    setValue('actividades', updated)
  }

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  const activitiesError =
    typeof errors.actividades?.message === 'string'
      ? errors.actividades?.message
      : null

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
            {...register('address')}
            disabled={isSaving}
          />
          {errors.address ? (
            <p className="text-xs text-red-500">{errors.address.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="generoId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Género
          </label>
          <AsyncSelect<ClientCatalogItem>
            value={genderOptions.find((option) => option.value === generoId) ?? null}
            onChange={(option) =>
              setValue('generoId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) => Promise.resolve(filterOptions(genderOptions, inputValue))}
            placeholder="Selecciona..."
            inputId="generoId"
            instanceId="client-genero-id"
            isDisabled={isSaving}
            defaultOptions={genderOptions}
            noOptionsMessage="Sin géneros"
          />
          <input type="hidden" {...register('generoId')} />
          {errors.generoId ? (
            <p className="text-xs text-red-500">{errors.generoId.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="estadoCivilId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Estado civil
          </label>
          <AsyncSelect<ClientCatalogItem>
            value={civilStatusOptions.find((option) => option.value === estadoCivilId) ?? null}
            onChange={(option) =>
              setValue('estadoCivilId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) =>
              Promise.resolve(filterOptions(civilStatusOptions, inputValue))
            }
            placeholder="Selecciona..."
            inputId="estadoCivilId"
            instanceId="client-estado-civil-id"
            isDisabled={isSaving}
            defaultOptions={civilStatusOptions}
            noOptionsMessage="Sin estados civiles"
          />
          <input type="hidden" {...register('estadoCivilId')} />
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
          <AsyncSelect<ClientCatalogItem>
            value={professionOptions.find((option) => option.value === profesionId) ?? null}
            onChange={(option) =>
              setValue('profesionId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) =>
              Promise.resolve(filterOptions(professionOptions, inputValue))
            }
            placeholder="Selecciona..."
            inputId="profesionId"
            instanceId="client-profesion-id"
            isDisabled={isSaving}
            defaultOptions={professionOptions}
            noOptionsMessage="Sin profesiones"
          />
          <input type="hidden" {...register('profesionId')} />
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
          <DatePicker
            value={fechaNacimiento}
            onChange={(dateValue) =>
              setValue('fechaNacimiento', dateValue, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            onBlur={() =>
              setValue('fechaNacimiento', getValues('fechaNacimiento'), {
                shouldValidate: true,
                shouldTouch: true,
              })
            }
            placeholder="Selecciona la fecha de nacimiento"
            error={errors.fechaNacimiento?.message}
            disabled={isSaving}
            maxDate={new Date()}
          />
          <input type="hidden" {...register('fechaNacimiento')} />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="departmentId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Departamento
          </label>
          <AsyncSelect<Department>
            value={
              departmentOptions.find((option) => option.value === selectedDepartmentId) ?? null
            }
            onChange={(option) => handleDepartmentChange(option?.value ?? '')}
            loadOptions={(inputValue) =>
              Promise.resolve(filterOptions(departmentOptions, inputValue))
            }
            placeholder="Selecciona..."
            inputId="departmentId"
            instanceId="client-department-id"
            isDisabled={isSaving}
            defaultOptions={departmentOptions}
            noOptionsMessage="Sin departamentos"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="municipioId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Municipio
          </label>
          <AsyncSelect<Municipality>
            value={
              municipalityAsyncOptions.find((option) => option.value === municipalityId) ?? null
            }
            onChange={(option) =>
              setValue('municipioId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) =>
              Promise.resolve(filterOptions(municipalityAsyncOptions, inputValue))
            }
            placeholder="Selecciona..."
            inputId="municipioId"
            instanceId="client-municipio-id"
            isDisabled={isSaving || (!municipalityOptions.length && !municipalityId)}
            defaultOptions={municipalityAsyncOptions}
            noOptionsMessage={
              selectedDepartmentId
                ? 'Sin municipios para este departamento'
                : 'Selecciona un departamento'
            }
          />
          <input type="hidden" {...register('municipioId')} />
          {errors.municipioId ? (
            <p className="text-xs text-red-500">
              {errors.municipioId.message}
            </p>
          ) : !municipalityOptions.length ? (
            <p className="text-xs text-amber-600 dark:text-amber-300">
              Selecciona un departamento para mostrar sus municipios activos.
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
          <AsyncSelect<ClientCatalogItem>
            value={dependentOptions.find((option) => option.value === dependientesId) ?? null}
            onChange={(option) =>
              setValue('dependientesId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) =>
              Promise.resolve(filterOptions(dependentOptions, inputValue))
            }
            placeholder="Selecciona..."
            inputId="dependientesId"
            instanceId="client-dependientes-id"
            isDisabled={isSaving}
            defaultOptions={dependentOptions}
            noOptionsMessage="Sin dependientes"
          />
          <input type="hidden" {...register('dependientesId')} />
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
          <AsyncSelect<ClientCatalogItem>
            value={housingTypeOptions.find((option) => option.value === tipoViviendaId) ?? null}
            onChange={(option) =>
              setValue('tipoViviendaId', option?.value ?? '', { shouldValidate: true })
            }
            loadOptions={(inputValue) =>
              Promise.resolve(filterOptions(housingTypeOptions, inputValue))
            }
            placeholder="Selecciona..."
            inputId="tipoViviendaId"
            instanceId="client-tipo-vivienda-id"
            isDisabled={isSaving}
            defaultOptions={housingTypeOptions}
            noOptionsMessage="Sin tipos de vivienda"
          />
          <input type="hidden" {...register('tipoViviendaId')} />
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
          {references.map((reference, index) => {
            const isInactive = reference.activo === false
            return (
            <div
              key={`${reference.id ?? index}-${reference.nombreCompleto}`}
              className={`flex flex-col gap-2 rounded-xl border p-3 ${
                isInactive
                  ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-500/10'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {reference.nombreCompleto}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {reference.parentesco} · {reference.telefono}
                  </p>
                  {reference.address ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {reference.address}
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
                  className="btn-table-action"
                  onClick={() => openEditReferenceModal(index)}
                  disabled={isSaving}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-table-action"
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
                {!isEdit ? (
                  <button
                    type="button"
                    className="btn-table-action text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                    onClick={() => handleDeleteReference(index)}
                    disabled={isSaving}
                  >
                    Eliminar
                  </button>
                ) : null}
              </div>
            </div>
          )
          })}
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
        {activitiesError ? (
          <p className="text-sm font-medium text-red-600 dark:text-red-300">
            {activitiesError}
          </p>
        ) : null}

        <div className="space-y-2">
          {activities.map((activity, index) => {
            const isInactive = activity.activo === false
            return (
            <div
              key={`${activity.id ?? index}-${activity.actividadId}`}
              className={`space-y-2 rounded-xl border p-3 ${
                isInactive
                  ? 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-500/10'
                  : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
              }`}
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
                  className="btn-table-action"
                  onClick={() => openEditActivityModal(index)}
                  disabled={isSaving}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="btn-table-action"
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
                  className="btn-table-action"
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
                {!isEdit ? (
                  <button
                    type="button"
                    className="btn-table-action text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                    onClick={() => handleDeleteActivity(index)}
                    disabled={isSaving}
                  >
                    Eliminar
                  </button>
                ) : null}
              </div>
            </div>
          )
          })}
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
