import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { useNotifications } from '@/providers/NotificationProvider'
import { useCollateralCatalogsCache } from '@/presentation/features/collaterals/hooks/use-collateral-catalogs-cache'
import { useCollateralClientSearch } from '@/presentation/features/collaterals/hooks/use-collateral-client-search'
import { useCollateralForm } from '@/presentation/features/collaterals/hooks/use-collateral-form'
import { useCollateralDetail } from '@/presentation/features/collaterals/hooks/use-collateral-detail'
import {
  collateralCreateSchema,
  collateralUpdateSchema,
  type CollateralCreateFormValues,
} from '@/infrastructure/validations/collaterals/collateral-form.schema'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { CreateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/create-collateral-request'
import type { UpdateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/update-collateral-request'

const normalizeEmpty = (value?: string | null) => {
  const text = value?.trim()
  return text ? text : null
}

type CollateralFormValues = CollateralCreateFormValues & {
  statusId?: string | null
  isActive?: boolean
}

export const CollateralFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { notify } = useNotifications()

  const { types, statuses, isLoading: isLoadingCatalogs, error: catalogsError } =
    useCollateralCatalogsCache()
  const { searchClients } = useCollateralClientSearch()
  const { collateral, isLoading, error: detailError, loadById } = useCollateralDetail()
  const { create, update, isSaving, error, errorsByField } = useCollateralForm()

  const [selectedClient, setSelectedClient] = useState<
    AsyncSelectOption<ClientListItem> | null
  >(null)

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
      collateralTypeId: '',
      statusId: '',
      referenceNo: '',
      description: '',
      appraisedValue: null,
      appraisedDate: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (!id) return
    void loadById(id)
  }, [id, loadById])

  useEffect(() => {
    if (!collateral) return

    reset({
      ownerClientId: collateral.ownerClientId,
      collateralTypeId: collateral.collateralTypeId,
      statusId: collateral.statusId,
      referenceNo: collateral.referenceNo ?? '',
      description: collateral.description ?? '',
      appraisedValue: collateral.appraisedValue ?? null,
      appraisedDate: collateral.appraisedDate ?? '',
      isActive: collateral.isActive,
    })

    if (collateral.ownerClientId) {
      setSelectedClient({
        value: collateral.ownerClientId,
        label: `${collateral.ownerClientName ?? collateral.ownerClientFullName ?? 'Cliente'}${
          collateral.ownerIdentity ?? collateral.ownerClientIdentityNo
            ? ` - ${formatHnIdentity(
                collateral.ownerIdentity ?? collateral.ownerClientIdentityNo,
              )}`
            : ''
        }`,
      })
    }
  }, [collateral, reset])

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

  const submitHandler = handleSubmit(async (values) => {
    const commonPayload = {
      ownerClientId: values.ownerClientId,
      collateralTypeId: values.collateralTypeId,
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
              Cliente
            </label>
            <AsyncSelect<ClientListItem>
              value={selectedClient}
              onChange={(option) => {
                setSelectedClient(option)
                setValue('ownerClientId', option?.value ?? '', {
                  shouldValidate: true,
                })
              }}
              loadOptions={searchClients}
              placeholder="Buscar cliente..."
              noOptionsMessage="Sin resultados"
              isDisabled={isSaving || isEdit}
            />
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
            {errors.collateralTypeId ? (
              <p className="text-xs text-red-500">{errors.collateralTypeId.message}</p>
            ) : null}
          </div>

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
              Referencia
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
              Descripción
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
              Valor Avalúo
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
    </div>
  )
}
