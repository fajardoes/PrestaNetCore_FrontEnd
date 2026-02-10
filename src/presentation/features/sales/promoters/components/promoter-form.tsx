import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import {
  promoterFormSchema,
  type PromoterFormValues,
} from '@/infrastructure/validations/sales/promoter.schema'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'
import { useEmployeeClientsSelect } from '@/presentation/features/sales/promoters/hooks/use-employee-clients-select'

interface PromoterFormProps {
  initialValues?: PromoterFormValues
  promoter?: PromoterResponse | null
  agencies: Agency[]
  agenciesLoading?: boolean
  agenciesError?: string | null
  isEdit?: boolean
  isSaving?: boolean
  error?: string | null
  onSubmit: (values: PromoterFormValues) => Promise<void> | void
  onCancel: () => void
}

export const PromoterForm = ({
  initialValues,
  promoter,
  agencies,
  agenciesLoading,
  agenciesError,
  isEdit = false,
  isSaving,
  error,
  onSubmit,
  onCancel,
}: PromoterFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PromoterFormValues>({
    resolver: zodResolver(promoterFormSchema),
    defaultValues: {
      clientId: '',
      agencyId: '',
      code: '',
      notes: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    }
  }, [initialValues, reset])

  const { loadOptions } = useEmployeeClientsSelect()
  const [selectedClient, setSelectedClient] = useState<
    AsyncSelectOption<ClientListItem> | null
  >(null)

  const sortedAgencies = useMemo(
    () => [...agencies].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [agencies],
  )

  useEffect(() => {
    if (promoter?.clientId) {
      const label = `${promoter.clientFullName ?? 'Sin nombre'}${
        promoter.clientIdentityNo
          ? ` - ${formatHnIdentity(promoter.clientIdentityNo)}`
          : ''
      }`.trim()
      setSelectedClient({
        value: promoter.clientId,
        label,
      })
      setValue('clientId', promoter.clientId, { shouldValidate: true })
    }
  }, [promoter, setValue])

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <form className="space-y-5" onSubmit={submitHandler} noValidate>
      {promoter ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            Cliente asociado
          </p>
          <p>
            {promoter.clientFullName ?? 'Sin nombre'}
            {promoter.clientIdentityNo
              ? ` - ${formatHnIdentity(promoter.clientIdentityNo)}`
              : ''}
          </p>
          {promoter.clientEmail ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {promoter.clientEmail}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="clientSearch"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Cliente empleado
          </label>
          <AsyncSelect<ClientListItem>
            value={selectedClient}
            onChange={(option) => {
              setSelectedClient(option)
              setValue('clientId', option?.value ?? '', { shouldValidate: true })
            }}
            loadOptions={loadOptions}
            placeholder="Buscar por nombre o identidad..."
            inputId="clientSearch"
            instanceId="promoter-client-select"
            isDisabled={isSaving || isEdit}
            noOptionsMessage="Sin coincidencias"
          />
          <input type="hidden" {...register('clientId')} />
          {!isEdit ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escribe al menos 2 caracteres para buscar clientes empleados activos.
            </p>
          ) : null}
          {errors.clientId ? (
            <p className="text-xs text-red-500">{errors.clientId.message}</p>
          ) : null}
          {!isEdit && selectedClient ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-300">
              Seleccionado: {selectedClient.label}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="agencyId"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Agencia
          </label>
          <select
            id="agencyId"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...register('agencyId')}
            disabled={isSaving || agenciesLoading}
          >
            <option value="">Selecciona una agencia</option>
            {sortedAgencies.map((agency) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
          {agenciesError ? (
            <p className="text-xs text-red-500">{agenciesError}</p>
          ) : null}
          {errors.agencyId ? (
            <p className="text-xs text-red-500">{errors.agencyId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="code"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Codigo (opcional)
        </label>
        <input
          id="code"
          type="text"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          {...register('code')}
          disabled={isSaving}
        />
        {errors.code ? (
          <p className="text-xs text-red-500">{errors.code.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          {...register('notes')}
          disabled={isSaving}
        />
        {errors.notes ? (
          <p className="text-xs text-red-500">{errors.notes.message}</p>
        ) : null}
      </div>

      {isEdit ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">
              Promotor activo
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Controla si el promotor esta disponible en el sistema.
            </p>
          </div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
              {...register('isActive')}
              disabled={isSaving}
            />
            <span className="text-sm text-slate-700 dark:text-slate-200">
              Activo
            </span>
          </label>
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
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSaving || agenciesLoading}
        >
          {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
