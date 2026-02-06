import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  promoterFormSchema,
  type PromoterFormValues,
} from '@/infrastructure/validations/sales/promoter.schema'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import { useEmployeeClientsSearch } from '@/presentation/features/sales/promoters/hooks/use-employee-clients-search'

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
    watch,
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

  const selectedClientId = watch('clientId')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientListItem | null>(
    null,
  )
  const [showResults, setShowResults] = useState(false)
  const lastAppliedSearch = useRef('')
  const {
    results,
    isLoading: isSearching,
    error: searchError,
    searchEmployees,
    clear,
  } = useEmployeeClientsSearch()

  const sortedAgencies = useMemo(
    () => [...agencies].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [agencies],
  )

  useEffect(() => {
    if (promoter?.clientId) {
      setValue('clientId', promoter.clientId)
      setSelectedClient({
        id: promoter.clientId,
        nombreCompleto: promoter.clientFullName ?? 'Sin nombre',
        identidad: promoter.clientIdentityNo ?? '',
        activo: true,
      })
    }
  }, [promoter, setValue])

  useEffect(() => {
    if (isEdit) return
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      if (lastAppliedSearch.current !== '') {
        lastAppliedSearch.current = ''
        clear()
        setShowResults(false)
      }
      return
    }
    const timer = setTimeout(() => {
      if (lastAppliedSearch.current === trimmed) return
      lastAppliedSearch.current = trimmed
      void searchEmployees(trimmed)
      setShowResults(true)
    }, 450)
    return () => clearTimeout(timer)
  }, [searchTerm, searchEmployees, clear, isEdit])

  const selectedLabel = useMemo(() => {
    if (!selectedClient) return null
    return `${selectedClient.nombreCompleto} ${selectedClient.identidad ? `- ${selectedClient.identidad}` : ''}`.trim()
  }, [selectedClient])

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
              ? ` - ${promoter.clientIdentityNo}`
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
          <div className="relative">
            <input
              id="clientSearch"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              placeholder="Buscar por nombre o identidad..."
              value={isEdit ? selectedLabel ?? '' : searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setSelectedClient(null)
                setValue('clientId', '')
              }}
              onFocus={() => {
                if (!isEdit && results.length) setShowResults(true)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setShowResults(false)
                }
              }}
              disabled={isSaving || isEdit}
            />
            {!isEdit && showResults ? (
              <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                {isSearching ? (
                  <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                    Buscando clientes...
                  </div>
                ) : searchError ? (
                  <div className="px-3 py-2 text-sm text-red-600 dark:text-red-300">
                    {searchError}
                  </div>
                ) : results.length ? (
                  <ul className="max-h-60 overflow-auto py-1">
                    {results.map((client) => (
                      <li key={client.id}>
                        <button
                          type="button"
                          className="flex w-full flex-col gap-1 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setSelectedClient(client)
                            setValue('clientId', client.id, { shouldValidate: true })
                            setSearchTerm(
                              `${client.nombreCompleto} ${client.identidad ? `- ${client.identidad}` : ''}`.trim(),
                            )
                            setShowResults(false)
                          }}
                        >
                          <span className="font-medium">{client.nombreCompleto}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {client.identidad || 'Sin identidad'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                    No hay resultados.
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <input type="hidden" {...register('clientId')} />
          {!isEdit ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escribe al menos 2 caracteres para buscar clientes empleados activos.
            </p>
          ) : null}
          {errors.clientId ? (
            <p className="text-xs text-red-500">{errors.clientId.message}</p>
          ) : null}
          {!isEdit && selectedClientId && selectedClient ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-300">
              Seleccionado: {selectedClient.nombreCompleto}
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
