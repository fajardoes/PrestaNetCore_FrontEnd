import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { listMunicipalitiesAction } from '@/core/actions/geography/list-municipalities.action'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { useNotifications } from '@/providers/NotificationProvider'
import { CollateralClientPickerModal } from '@/presentation/features/collaterals/components/collateral-client-picker-modal'
import { useCollateralCatalogsCache } from '@/presentation/features/collaterals/hooks/use-collateral-catalogs-cache'
import { useCollateralClientSearch } from '@/presentation/features/collaterals/hooks/use-collateral-client-search'
import { useCollateralForm } from '@/presentation/features/collaterals/hooks/use-collateral-form'
import { useCollateralDetail } from '@/presentation/features/collaterals/hooks/use-collateral-detail'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import {
  collateralCreateSchema,
  collateralUpdateSchema,
  type CollateralCreateFormValues,
} from '@/infrastructure/validations/collaterals/collateral-form.schema'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { CreateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/create-collateral-request'
import type { UpdateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/update-collateral-request'

const PERSONAL_GUARANTOR_TYPE_CODE = 'PERSONAL_GUARANTOR'

type ClientPickerTarget = 'owner' | 'guarantor' | null

type SelectedClient = {
  id: string
  fullName: string
  identityNo?: string | null
}

const normalizeEmpty = (value?: string | null) => {
  const text = value?.trim()
  return text ? text : null
}

const isPersonalGuarantorType = (code?: string | null) =>
  (code ?? '').trim().toUpperCase() === PERSONAL_GUARANTOR_TYPE_CODE

const mapClientToSelected = (client: ClientListItem): SelectedClient => ({
  id: client.id,
  fullName: client.nombreCompleto,
  identityNo: client.identidad,
})

type CollateralFormValues = CollateralCreateFormValues & {
  statusId?: string | null
  isActive?: boolean
}

export const CollateralFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { notify } = useNotifications()
  const {
    hasPermission,
    isLoading: isLoadingPermissions,
  } = useUserPermissions()
  const canReadCollaterals = hasPermission('collaterals.read')
  const canCreateCollaterals = hasPermission('collaterals.create')
  const canUpdateCollaterals = hasPermission('collaterals.update')
  const canReadCatalogs = hasPermission('collaterals.catalogs.read')

  const { types, statuses, isLoading: isLoadingCatalogs, error: catalogsError } =
    useCollateralCatalogsCache({ enabled: canReadCatalogs })
  const { listClients } = useCollateralClientSearch()
  const { collateral, isLoading, error: detailError, loadById } = useCollateralDetail()
  const { create, update, isSaving, error, errorsByField } = useCollateralForm()

  const [selectedOwnerClient, setSelectedOwnerClient] = useState<SelectedClient | null>(null)
  const [selectedGuarantorClient, setSelectedGuarantorClient] = useState<SelectedClient | null>(null)

  const [pickerTarget, setPickerTarget] = useState<ClientPickerTarget>(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerPage, setPickerPage] = useState(1)
  const [pickerTotalPages, setPickerTotalPages] = useState(1)
  const [pickerClients, setPickerClients] = useState<ClientListItem[]>([])
  const [pickerError, setPickerError] = useState<string | null>(null)
  const [isPickerLoading, setIsPickerLoading] = useState(false)
  const [municipalityNameById, setMunicipalityNameById] = useState<Record<string, string>>({})

  const resolver = useMemo(
    () => yupResolver(isEdit ? collateralUpdateSchema : collateralCreateSchema),
    [isEdit],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<CollateralFormValues>({
    resolver,
    defaultValues: {
      ownerClientId: '',
      guarantorClientId: null,
      collateralTypeId: '',
      collateralTypeCode: '',
      statusId: '',
      referenceNo: '',
      description: '',
      appraisedValue: undefined,
      appraisedDate: '',
      isActive: true,
    },
  })

  const ownerClientId = watch('ownerClientId') ?? ''
  const guarantorClientId = watch('guarantorClientId') ?? ''
  const collateralTypeId = watch('collateralTypeId') ?? ''

  const selectedCollateralType = useMemo(
    () => types.find((item) => item.id === collateralTypeId),
    [types, collateralTypeId],
  )

  const requiresGuarantor = isPersonalGuarantorType(selectedCollateralType?.code)

  useEffect(() => {
    if (!id || !canReadCollaterals) return
    void loadById(id)
  }, [canReadCollaterals, id, loadById])

  useEffect(() => {
    if (!canReadCatalogs) return
    const loadMunicipalities = async () => {
      const result = await listMunicipalitiesAction()
      if (!result.success) return

      const next = result.data.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = `${item.departmentName} · ${item.name}`
        return acc
      }, {})

      setMunicipalityNameById(next)
    }

    void loadMunicipalities()
  }, [canReadCatalogs])

  useEffect(() => {
    if (!collateral) return

    reset({
      ownerClientId: collateral.ownerClientId,
      guarantorClientId: collateral.guarantorClientId ?? null,
      collateralTypeId: collateral.collateralTypeId,
      collateralTypeCode: collateral.collateralTypeCode ?? '',
      statusId: collateral.statusId,
      referenceNo: collateral.referenceNo ?? '',
      description: collateral.description ?? '',
      appraisedValue: collateral.appraisedValue ?? undefined,
      appraisedDate: collateral.appraisedDate ?? '',
      isActive: collateral.isActive,
    })

    if (collateral.ownerClientId) {
      setSelectedOwnerClient({
        id: collateral.ownerClientId,
        fullName: collateral.ownerClientName ?? collateral.ownerClientFullName ?? 'Cliente',
        identityNo: collateral.ownerIdentity ?? collateral.ownerClientIdentityNo,
      })
    } else {
      setSelectedOwnerClient(null)
    }

    if (collateral.guarantorClientId) {
      setSelectedGuarantorClient({
        id: collateral.guarantorClientId,
        fullName: collateral.guarantorClientFullName ?? 'Cliente aval',
        identityNo: collateral.guarantorClientIdentityNo,
      })
    } else {
      setSelectedGuarantorClient(null)
    }
  }, [collateral, reset])

  useEffect(() => {
    setValue('collateralTypeCode', selectedCollateralType?.code ?? '', {
      shouldValidate: true,
    })
  }, [selectedCollateralType?.code, setValue])

  useEffect(() => {
    if (requiresGuarantor) return

    setSelectedGuarantorClient(null)
    setValue('guarantorClientId', null, { shouldValidate: true })
    clearErrors('guarantorClientId')
  }, [clearErrors, requiresGuarantor, setValue])

  useEffect(() => {
    if (!ownerClientId || !guarantorClientId) return
    if (ownerClientId !== guarantorClientId) return

    setSelectedGuarantorClient(null)
    setValue('guarantorClientId', null, { shouldValidate: true })
    setError('guarantorClientId', {
      type: 'validate',
      message: 'El cliente aval debe ser distinto del titular.',
    })
  }, [guarantorClientId, ownerClientId, setError, setValue])

  useEffect(() => {
    clearErrors()
    Object.entries(errorsByField).forEach(([field, messages]) => {
      const message = messages[0]
      if (!message) return
      setError(field as keyof CollateralFormValues, {
        type: 'server',
        message,
      })
    })
  }, [clearErrors, errorsByField, setError])

  useEffect(() => {
    if (!pickerTarget) return

    let isActive = true

    const loadClients = async () => {
      setIsPickerLoading(true)
      setPickerError(null)

      try {
        const result = await listClients({
          pageNumber: pickerPage,
          pageSize: 10,
          search: pickerSearch,
          active: true,
        })

        if (!isActive) return

        setPickerClients(result.items)
        setPickerTotalPages(result.totalPages)
      } catch (loadError) {
        if (!isActive) return
        setPickerClients([])
        setPickerTotalPages(1)
        setPickerError(
          loadError instanceof Error
            ? loadError.message
            : 'No fue posible cargar clientes.',
        )
      } finally {
        if (!isActive) return
        setIsPickerLoading(false)
      }
    }

    void loadClients()

    return () => {
      isActive = false
    }
  }, [listClients, pickerPage, pickerSearch, pickerTarget])

  const openPicker = (target: Exclude<ClientPickerTarget, null>) => {
    setPickerTarget(target)
    setPickerSearch('')
    setPickerPage(1)
    setPickerError(null)
  }

  const closePicker = () => {
    setPickerTarget(null)
    setPickerClients([])
    setPickerTotalPages(1)
    setPickerPage(1)
    setPickerSearch('')
    setPickerError(null)
  }

  const handleSelectClient = (client: ClientListItem) => {
    if (pickerTarget === 'owner') {
      const nextOwner = mapClientToSelected(client)
      setSelectedOwnerClient(nextOwner)
      setValue('ownerClientId', client.id, { shouldValidate: true })

      if (guarantorClientId === client.id) {
        setSelectedGuarantorClient(null)
        setValue('guarantorClientId', null, { shouldValidate: true })
      }

      closePicker()
      return
    }

    if (pickerTarget === 'guarantor') {
      if (ownerClientId && ownerClientId === client.id) {
        return
      }

      setSelectedGuarantorClient(mapClientToSelected(client))
      setValue('guarantorClientId', client.id, { shouldValidate: true })
      closePicker()
    }
  }

  const submitHandler = handleSubmit(async (values) => {
    const shouldSendGuarantor = isPersonalGuarantorType(values.collateralTypeCode)

    const commonPayload = {
      ownerClientId: values.ownerClientId,
      collateralTypeId: values.collateralTypeId,
      guarantorClientId: shouldSendGuarantor
        ? normalizeEmpty(values.guarantorClientId ?? '')
        : null,
      referenceNo: normalizeEmpty(values.referenceNo),
      description: normalizeEmpty(values.description),
      appraisedValue:
        values.appraisedValue === null || values.appraisedValue === undefined
          ? null
          : Number(values.appraisedValue),
      appraisedDate: normalizeEmpty(values.appraisedDate),
    }

    if (isEdit && id) {
      const payload: UpdateCollateralRequestDto = {
        ...commonPayload,
        statusId: values.statusId ?? '',
        isActive: values.isActive ?? true,
      }
      const result = await update(id, payload)
      if (result.success) {
        notify('Garantía actualizada correctamente.', 'success')
        navigate(`/clients/collaterals/${result.data.id}`)
      }
      return
    }

    const payload: CreateCollateralRequestDto = {
      ...commonPayload,
      statusId: normalizeEmpty(values.statusId),
    }

    const result = await create(payload)
    if (result.success) {
      notify('Garantía creada correctamente.', 'success')
      navigate(`/clients/collaterals/${result.data.id}`)
    }
  })

  if (isLoadingPermissions) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando permisos...
      </div>
    )
  }

  if (!canReadCatalogs) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para consultar catálogos de garantías.
        </p>
      </div>
    )
  }

  if (isEdit && !canReadCollaterals) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para consultar garantías.
        </p>
      </div>
    )
  }

  if (isEdit && !canUpdateCollaterals) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para editar garantías.
        </p>
      </div>
    )
  }

  if (!isEdit && !canCreateCollaterals) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">No autorizado</p>
        <p className="text-sm">
          Tu usuario no tiene permiso para crear garantías.
        </p>
      </div>
    )
  }

  if (isEdit && isLoading && !collateral) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando garantía...
      </div>
    )
  }

  if (isEdit && detailError && !collateral) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
        {detailError}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {isEdit ? 'Editar Garantía' : 'Nueva Garantía'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra la garantía del cliente, su tipo, estado y avalúo.
        </p>
      </div>

      <form
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        onSubmit={submitHandler}
        noValidate
      >
        {!isEdit ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:border-sky-900/60 dark:bg-sky-500/10 dark:text-sky-100">
            Los documentos se adjuntan después de guardar la garantía, en la
            pestaña <span className="font-semibold">Documentos</span> del detalle.
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Cliente titular
            </label>
            <div className="space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm text-slate-800 dark:text-slate-100">
                {selectedOwnerClient?.fullName ?? 'No se ha seleccionado un cliente.'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedOwnerClient?.identityNo
                  ? formatHnIdentity(selectedOwnerClient.identityNo)
                  : 'Identidad no disponible'}
              </p>
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => openPicker('owner')}
                disabled={isSaving || isEdit}
              >
                {selectedOwnerClient ? 'Cambiar titular' : 'Seleccionar titular'}
              </button>
            </div>
            <input type="hidden" {...register('ownerClientId')} />
            {errors.ownerClientId ? (
              <p className="text-xs text-red-500">{errors.ownerClientId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tipo de Garantía
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('collateralTypeId')}
              disabled={isSaving || isLoadingCatalogs}
            >
              <option value="">Selecciona un tipo</option>
              {types.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input type="hidden" {...register('collateralTypeCode')} />
            {errors.collateralTypeId ? (
              <p className="text-xs text-red-500">{errors.collateralTypeId.message}</p>
            ) : null}
          </div>

          {requiresGuarantor ? (
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Cliente aval
              </label>
              <div className="space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-sm text-slate-800 dark:text-slate-100">
                  {selectedGuarantorClient?.fullName ?? 'No se ha seleccionado cliente aval.'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedGuarantorClient?.identityNo
                    ? formatHnIdentity(selectedGuarantorClient.identityNo)
                    : 'Identidad no disponible'}
                </p>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => openPicker('guarantor')}
                  disabled={isSaving || !ownerClientId}
                >
                  {selectedGuarantorClient ? 'Cambiar aval' : 'Seleccionar aval'}
                </button>
                {!ownerClientId ? (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Selecciona primero un titular para elegir un aval distinto.
                  </p>
                ) : null}
              </div>
              <input type="hidden" {...register('guarantorClientId')} />
              {errors.guarantorClientId ? (
                <p className="text-xs text-red-500">{errors.guarantorClientId.message}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Estado
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('statusId')}
              disabled={isSaving || isLoadingCatalogs}
            >
              <option value="">
                {isEdit ? 'Selecciona un estado' : 'Automático (Disponible por defecto)'}
              </option>
              {statuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {errors.statusId ? (
              <p className="text-xs text-red-500">{errors.statusId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Referencia *
            </label>
            <input
              type="text"
              maxLength={60}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('referenceNo')}
              disabled={isSaving}
            />
            {errors.referenceNo ? (
              <p className="text-xs text-red-500">{errors.referenceNo.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Descripción *
            </label>
            <textarea
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('description')}
              disabled={isSaving}
            />
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Valor Avalúo *
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('appraisedValue', {
                setValueAs: (value) => {
                  if (value === '' || value === null || value === undefined) {
                    return null
                  }
                  return Number(value)
                },
              })}
              disabled={isSaving}
            />
            {errors.appraisedValue ? (
              <p className="text-xs text-red-500">{errors.appraisedValue.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha Avalúo
            </label>
            <DatePicker
              value={watch('appraisedDate') ?? ''}
              onChange={(value) =>
                setValue('appraisedDate', value, { shouldValidate: true })
              }
              allowFutureDates={false}
            />
            {errors.appraisedDate ? (
              <p className="text-xs text-red-500">{errors.appraisedDate.message}</p>
            ) : null}
          </div>

          {isEdit ? (
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                  {...register('isActive')}
                  disabled={isSaving}
                />
                Activa
              </label>
            </div>
          ) : null}
        </div>

        {catalogsError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-200">
            {catalogsError}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/clients/collaterals')}
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
            {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </form>

      <CollateralClientPickerModal
        open={pickerTarget !== null}
        title={pickerTarget === 'guarantor' ? 'Seleccionar cliente aval' : 'Seleccionar cliente titular'}
        description={
          pickerTarget === 'guarantor'
            ? 'Busca por nombre o identidad y selecciona un cliente activo distinto del titular.'
            : 'Busca por nombre o identidad y selecciona un cliente activo.'
        }
        clients={pickerClients}
        search={pickerSearch}
        page={pickerPage}
        totalPages={pickerTotalPages}
        isLoading={isPickerLoading}
        error={pickerError}
        selectedClientId={pickerTarget === 'guarantor' ? guarantorClientId : ownerClientId}
        excludedClientId={pickerTarget === 'guarantor' ? ownerClientId : undefined}
        municipalityNameById={municipalityNameById}
        onSearchChange={(value) => {
          setPickerSearch(value)
          setPickerPage(1)
        }}
        onPageChange={setPickerPage}
        onSelect={handleSelectClient}
        onClose={closePicker}
      />
    </div>
  )
}
