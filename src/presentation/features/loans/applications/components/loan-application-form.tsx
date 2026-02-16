import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import {
  loanApplicationSchema,
  type LoanApplicationFormValues,
} from '@/infrastructure/validations/loans/loan-application.schema'
import type { ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { Municipality } from '@/infrastructure/interfaces/organization/geography'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import { LoanApplicationClientPickerModal } from '@/presentation/features/loans/applications/components/loan-application-client-picker-modal'
import { LoanApplicationPaymentFrequencyPickerModal } from '@/presentation/features/loans/applications/components/loan-application-payment-frequency-picker-modal'
import { LoanApplicationPromoterPickerModal } from '@/presentation/features/loans/applications/components/loan-application-promoter-picker-modal'
import { LoanApplicationProductPickerModal } from '@/presentation/features/loans/applications/components/loan-application-product-picker-modal'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'

interface LoanApplicationFormProps {
  initialValues?: Partial<LoanApplicationFormValues>
  isSubmitting?: boolean
  readOnly?: boolean
  onSubmit: (values: LoanApplicationFormValues) => Promise<void> | void
  onCancel: () => void
  listClients: (params: {
    pageNumber?: number
    pageSize?: number
    search?: string
    active?: boolean
  }) => Promise<{ items: ClientListItem[]; totalPages: number }>
  listMunicipalities: () => Promise<Municipality[]>
  findClientById: (
    id: string,
  ) => Promise<AsyncSelectOption<ClientListItem> | null>
  listPromoters: (search?: string) => Promise<PromoterResponse[]>
  findPromoterById: (
    id: string,
  ) => Promise<AsyncSelectOption<PromoterResponse> | null>
  listLoanProducts: (search?: string) => Promise<LoanProductListItemDto[]>
  findLoanProductById: (
    id: string,
  ) => Promise<AsyncSelectOption<LoanProductListItemDto> | null>
  getLoanProductDisplayInfo: (id: string) => Promise<{
    nominalRate: number
    termUnitLabel: string
    interestRateTypeLabel: string
    rateBaseLabel: string
    paymentFrequencyId: string
    paymentFrequencyLabel: string
  } | null>
  listPaymentFrequencies: (search?: string) => Promise<LoanCatalogItemDto[]>
  findPaymentFrequencyById: (
    id: string,
  ) => Promise<AsyncSelectOption<LoanCatalogItemDto> | null>
}

const defaultValues: LoanApplicationFormValues = {
  clientId: '',
  loanProductId: '',
  promoterId: '',
  requestedPrincipal: 0,
  requestedTerm: 0,
  requestedPaymentFrequencyId: '',
  suggestedPaymentFrequencyId: null,
  notes: null,
}

const normalizeTermUnitLabel = (value?: string | null) => {
  if (!value) return 'unidad'
  const trimmed = value.trim()
  if (!trimmed) return 'unidad'

  const separatorIndex = trimmed.indexOf(' - ')
  if (separatorIndex >= 0) {
    const friendly = trimmed.slice(separatorIndex + 3).trim()
    if (friendly) return friendly
  }

  const normalized = trimmed.toUpperCase()
  if (normalized === 'MONTHS' || normalized === 'MONTH') return 'Meses'
  if (normalized === 'WEEKS' || normalized === 'WEEK') return 'Semanas'
  if (normalized === 'DAYS' || normalized === 'DAY') return 'Dias'
  if (normalized === 'YEARS' || normalized === 'YEAR') return 'Anos'
  return trimmed
}

export const LoanApplicationForm = ({
  initialValues,
  isSubmitting = false,
  readOnly = false,
  onSubmit,
  onCancel,
  listClients,
  listMunicipalities,
  findClientById,
  listPromoters,
  findPromoterById,
  listLoanProducts,
  findLoanProductById,
  getLoanProductDisplayInfo,
  listPaymentFrequencies,
  findPaymentFrequencyById,
}: LoanApplicationFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LoanApplicationFormValues>({
    resolver: yupResolver(loanApplicationSchema),
    defaultValues,
  })

  const [clientOption, setClientOption] = useState<AsyncSelectOption<ClientListItem> | null>(
    null,
  )
  const [clientPickerOpen, setClientPickerOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [clientPage, setClientPage] = useState(1)
  const [clientTotalPages, setClientTotalPages] = useState(1)
  const [clientRows, setClientRows] = useState<ClientListItem[]>([])
  const [municipalityNameById, setMunicipalityNameById] = useState<Record<string, string>>({})
  const [clientRowsLoading, setClientRowsLoading] = useState(false)
  const [clientRowsError, setClientRowsError] = useState<string | null>(null)
  const [productOption, setProductOption] = useState<
    AsyncSelectOption<LoanProductListItemDto> | null
  >(null)
  const [productDisplayInfo, setProductDisplayInfo] = useState<{
    nominalRate: number
    termUnitLabel: string
    interestRateTypeLabel: string
    rateBaseLabel: string
  } | null>(null)
  const [productDisplayLoading, setProductDisplayLoading] = useState(false)
  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [productRows, setProductRows] = useState<LoanProductListItemDto[]>([])
  const [productRowsLoading, setProductRowsLoading] = useState(false)
  const [productRowsError, setProductRowsError] = useState<string | null>(null)
  const [promoterOption, setPromoterOption] = useState<
    AsyncSelectOption<PromoterResponse> | null
  >(null)
  const [promoterPickerOpen, setPromoterPickerOpen] = useState(false)
  const [promoterSearch, setPromoterSearch] = useState('')
  const [promoterRows, setPromoterRows] = useState<PromoterResponse[]>([])
  const [promoterRowsLoading, setPromoterRowsLoading] = useState(false)
  const [promoterRowsError, setPromoterRowsError] = useState<string | null>(null)
  const [requestedFrequencyOption, setRequestedFrequencyOption] = useState<
    AsyncSelectOption<LoanCatalogItemDto> | null
  >(null)
  const [requestedFrequencyPickerOpen, setRequestedFrequencyPickerOpen] = useState(false)
  const [requestedFrequencySearch, setRequestedFrequencySearch] = useState('')
  const [requestedFrequencyRows, setRequestedFrequencyRows] = useState<LoanCatalogItemDto[]>([])
  const [requestedFrequencyRowsLoading, setRequestedFrequencyRowsLoading] = useState(false)
  const [requestedFrequencyRowsError, setRequestedFrequencyRowsError] = useState<string | null>(null)
  const [suggestedFrequencyOption, setSuggestedFrequencyOption] = useState<
    AsyncSelectOption<LoanCatalogItemDto> | null
  >(null)

  const loadClientsPage = useCallback(
    async (pageNumber: number, search: string) => {
      setClientRowsLoading(true)
      setClientRowsError(null)
      try {
        const data = await listClients({
          pageNumber,
          pageSize: 8,
          search: normalizeSearch(search),
          active: true,
        })
        setClientRows(data.items.filter((client) => !client.esEmpleado))
        setClientTotalPages(
          typeof data.totalPages === 'number' && Number.isFinite(data.totalPages)
            ? Math.max(1, data.totalPages)
            : 1,
        )
      } catch (error) {
        setClientRows([])
        setClientTotalPages(1)
        setClientRowsError(
          error instanceof Error
            ? error.message
            : 'No fue posible obtener la lista de clientes.',
        )
      } finally {
        setClientRowsLoading(false)
      }
    },
    [listClients],
  )

  useEffect(() => {
    const loadMunicipalities = async () => {
      const municipalities = await listMunicipalities()
      const map = municipalities.reduce<Record<string, string>>((acc, item) => {
        acc[item.id] = `${item.departmentName} · ${item.name}`
        return acc
      }, {})
      setMunicipalityNameById(map)
    }

    void loadMunicipalities()
  }, [listMunicipalities])

  useEffect(() => {
    if (!productPickerOpen) return

    const timeoutId = setTimeout(async () => {
      setProductRowsLoading(true)
      setProductRowsError(null)
      try {
        const items = await listLoanProducts(normalizeSearch(productSearch))
        setProductRows(items)
      } catch (error) {
        setProductRows([])
        setProductRowsError(
          error instanceof Error
            ? error.message
            : 'No fue posible obtener la lista de productos.',
        )
      } finally {
        setProductRowsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [listLoanProducts, productPickerOpen, productSearch])

  useEffect(() => {
    if (!promoterPickerOpen) return

    const timeoutId = setTimeout(async () => {
      setPromoterRowsLoading(true)
      setPromoterRowsError(null)
      try {
        const items = await listPromoters(normalizeSearch(promoterSearch))
        setPromoterRows(items)
      } catch (error) {
        setPromoterRows([])
        setPromoterRowsError(
          error instanceof Error
            ? error.message
            : 'No fue posible obtener la lista de promotores.',
        )
      } finally {
        setPromoterRowsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [listPromoters, promoterPickerOpen, promoterSearch])

  useEffect(() => {
    if (!requestedFrequencyPickerOpen) return

    const timeoutId = setTimeout(async () => {
      setRequestedFrequencyRowsLoading(true)
      setRequestedFrequencyRowsError(null)
      try {
        const items = await listPaymentFrequencies(normalizeSearch(requestedFrequencySearch))
        setRequestedFrequencyRows(items)
      } catch (error) {
        setRequestedFrequencyRows([])
        setRequestedFrequencyRowsError(
          error instanceof Error
            ? error.message
            : 'No fue posible obtener la lista de frecuencias.',
        )
      } finally {
        setRequestedFrequencyRowsLoading(false)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [listPaymentFrequencies, requestedFrequencyPickerOpen, requestedFrequencySearch])

  useEffect(() => {
    const values = {
      ...defaultValues,
      ...initialValues,
    }
    reset(values)

    const loadOptions = async () => {
      const [client, product, promoter, requestedFrequency, suggestedFrequency] =
        await Promise.all([
          values.clientId ? findClientById(values.clientId) : Promise.resolve(null),
          values.loanProductId
            ? findLoanProductById(values.loanProductId)
            : Promise.resolve(null),
          values.promoterId
            ? findPromoterById(values.promoterId)
            : Promise.resolve(null),
          values.requestedPaymentFrequencyId
            ? findPaymentFrequencyById(values.requestedPaymentFrequencyId)
            : Promise.resolve(null),
          values.suggestedPaymentFrequencyId
            ? findPaymentFrequencyById(values.suggestedPaymentFrequencyId)
            : Promise.resolve(null),
        ])

      setClientOption(client)
      setProductOption(product)
      setProductDisplayInfo(null)
      setPromoterOption(promoter)
      setRequestedFrequencyOption(requestedFrequency)
      setSuggestedFrequencyOption(suggestedFrequency)

      if (values.loanProductId) {
        setProductDisplayLoading(true)
        const display = await getLoanProductDisplayInfo(values.loanProductId)
        setProductDisplayInfo(display)
        setProductDisplayLoading(false)
      } else {
        setProductDisplayLoading(false)
      }
    }

    void loadOptions()
  }, [
    findClientById,
    findLoanProductById,
    getLoanProductDisplayInfo,
    findPaymentFrequencyById,
    findPromoterById,
    initialValues,
    reset,
  ])

  useEffect(() => {
    if (!clientPickerOpen) return
    void loadClientsPage(clientPage, clientSearch)
  }, [clientPage, clientPickerOpen, clientSearch, loadClientsPage])

  const resolvedTermUnitLabel = normalizeTermUnitLabel(
    productDisplayInfo?.termUnitLabel || productOption?.meta?.termUnit,
  )

  return (
    <>
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values)
        })}
      >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Cliente
          </label>
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  {clientOption?.meta ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {clientOption.meta.nombreCompleto}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Identidad: <HnIdentityText value={clientOption.meta.identidad} />
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Municipio: {resolveMunicipalityLabel(clientOption.meta, municipalityNameById)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      No has seleccionado un cliente.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => {
                      setClientPickerOpen(true)
                      setClientSearch('')
                      setClientPage(1)
                    }}
                    disabled={readOnly || isSubmitting}
                  >
                    {clientOption ? 'Cambiar cliente' : 'Seleccionar cliente'}
                  </button>

                  {clientOption && !readOnly ? (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => {
                        setClientOption(null)
                        field.onChange('')
                      }}
                      disabled={isSubmitting}
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          />
          {errors.clientId ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.clientId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Producto</label>
          <Controller
            control={control}
            name="loanProductId"
            render={({ field }) => (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  {productOption?.meta ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {productOption.meta.code} - {productOption.meta.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Monto: {formatMoney(productOption.meta.minAmount)} - {formatMoney(productOption.meta.maxAmount)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Plazo: {productOption.meta.minTerm} - {productOption.meta.maxTerm}{' '}
                        {resolvedTermUnitLabel}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tipo/Base tasa: {productDisplayInfo?.interestRateTypeLabel || '—'} /{' '}
                        {productDisplayInfo?.rateBaseLabel || '—'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Tasa anual:{' '}
                        {productDisplayInfo
                          ? formatRateAsPercent(productDisplayInfo.nominalRate)
                          : '—'}
                      </p>
                      {productDisplayLoading ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Cargando detalle de tasa...
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      No has seleccionado un producto.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => {
                      setProductPickerOpen(true)
                      setProductSearch('')
                    }}
                    disabled={readOnly || isSubmitting}
                  >
                    {productOption ? 'Cambiar producto' : 'Seleccionar producto'}
                  </button>
                  {productOption && !readOnly ? (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => {
                        setProductOption(null)
                        setProductDisplayInfo(null)
                        setProductDisplayLoading(false)
                        setSuggestedFrequencyOption(null)
                        setValue('suggestedPaymentFrequencyId', null, { shouldValidate: true })
                        field.onChange('')
                      }}
                      disabled={isSubmitting}
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          />
          {errors.loanProductId ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.loanProductId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Promotor
          </label>
          <Controller
            control={control}
            name="promoterId"
            render={({ field }) => (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  {promoterOption?.meta ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {promoterOption.meta.clientFullName || 'Promotor'}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Identidad: <HnIdentityText value={promoterOption.meta.clientIdentityNo} />
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Oficina: {promoterOption.meta.agencyName || '—'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      No has seleccionado un promotor.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => {
                      setPromoterPickerOpen(true)
                      setPromoterSearch('')
                    }}
                    disabled={readOnly || isSubmitting}
                  >
                    {promoterOption ? 'Cambiar promotor' : 'Seleccionar promotor'}
                  </button>

                  {promoterOption && !readOnly ? (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => {
                        setPromoterOption(null)
                        field.onChange('')
                      }}
                      disabled={isSubmitting}
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          />
          {errors.promoterId ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.promoterId.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Frecuencia sugerida
          </label>
          <input type="hidden" {...register('suggestedPaymentFrequencyId')} />
          <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
            {suggestedFrequencyOption?.meta ? (
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {suggestedFrequencyOption.meta.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Definida por el producto seleccionado.
                </p>
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                Selecciona un producto para visualizar la frecuencia sugerida.
              </p>
            )}
          </div>
          {errors.suggestedPaymentFrequencyId ? (
            <p className="text-xs text-red-600 dark:text-red-300">
              {errors.suggestedPaymentFrequencyId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Frecuencia solicitada
          </label>
          <Controller
            control={control}
            name="requestedPaymentFrequencyId"
            render={({ field }) => (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
                  {requestedFrequencyOption?.meta ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {requestedFrequencyOption.meta.name}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">
                      No has seleccionado una frecuencia.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs"
                    onClick={() => {
                      setRequestedFrequencyPickerOpen(true)
                      setRequestedFrequencySearch('')
                    }}
                    disabled={readOnly || isSubmitting}
                  >
                    {requestedFrequencyOption ? 'Cambiar frecuencia' : 'Seleccionar frecuencia'}
                  </button>

                  {requestedFrequencyOption && !readOnly ? (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => {
                        setRequestedFrequencyOption(null)
                        field.onChange('')
                      }}
                      disabled={isSubmitting}
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          />
          {errors.requestedPaymentFrequencyId ? (
            <p className="text-xs text-red-600 dark:text-red-300">
              {errors.requestedPaymentFrequencyId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Monto solicitado
          </label>
          <input
            type="number"
            step="0.01"
            disabled={readOnly || isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register('requestedPrincipal', { valueAsNumber: true })}
          />
          {errors.requestedPrincipal ? (
            <p className="text-xs text-red-600 dark:text-red-300">
              {errors.requestedPrincipal.message}
            </p>
          ) : null}
        </div>

      <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Plazo solicitado ({resolvedTermUnitLabel})
          </label>
          <input
            type="number"
            step="1"
            disabled={readOnly || isSubmitting}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            {...register('requestedTerm', { valueAsNumber: true })}
          />
          {errors.requestedTerm ? (
            <p className="text-xs text-red-600 dark:text-red-300">{errors.requestedTerm.message}</p>
          ) : null}
        </div>

      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notas</label>
        <textarea
          rows={3}
          maxLength={500}
          disabled={readOnly || isSubmitting}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          {...register('notes')}
        />
        {errors.notes ? (
          <p className="text-xs text-red-600 dark:text-red-300">{errors.notes.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          className="btn-secondary px-4 py-2 text-sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Volver
        </button>
        {!readOnly ? (
          <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar solicitud'}
          </button>
        ) : null}
      </div>

      </form>

      <LoanApplicationClientPickerModal
        open={clientPickerOpen}
        clients={clientRows}
        search={clientSearch}
        page={clientPage}
        totalPages={clientTotalPages}
        isLoading={clientRowsLoading}
        error={clientRowsError}
        selectedClientId={clientOption?.value}
        municipalityNameById={municipalityNameById}
        onSearchChange={(value) => {
          setClientSearch(value)
          setClientPage(1)
        }}
        onPageChange={(nextPage) =>
          setClientPage(Math.min(Math.max(1, nextPage), Math.max(1, clientTotalPages)))
        }
        onSelect={(client) => {
          setClientOption({
            value: client.id,
            label: `${client.nombreCompleto}${client.identidad ? ` - ${formatHnIdentity(client.identidad)}` : ''}`,
            meta: client,
          })
          setValue('clientId', client.id, { shouldValidate: true })
          setClientPickerOpen(false)
        }}
        onClose={() => setClientPickerOpen(false)}
      />

      <LoanApplicationProductPickerModal
        open={productPickerOpen}
        products={productRows}
        search={productSearch}
        isLoading={productRowsLoading}
        error={productRowsError}
        selectedProductId={productOption?.value}
        onSearchChange={setProductSearch}
        onSelect={(product) => {
          setProductOption({
            value: product.id,
            label: `${product.code} - ${product.name}`,
            meta: product,
          })
          setValue('loanProductId', product.id, { shouldValidate: true })
          setSuggestedFrequencyOption(null)
          setValue('suggestedPaymentFrequencyId', null, { shouldValidate: true })
          setProductDisplayLoading(true)
          void getLoanProductDisplayInfo(product.id)
            .then((display) => {
              setProductDisplayInfo(display)
              const paymentFrequencyId = display?.paymentFrequencyId
              if (!paymentFrequencyId) return

              void findPaymentFrequencyById(paymentFrequencyId).then((frequencyOption) => {
                if (frequencyOption) {
                  setSuggestedFrequencyOption(frequencyOption)
                  setValue('suggestedPaymentFrequencyId', frequencyOption.value, { shouldValidate: true })
                  return
                }

                if (!display?.paymentFrequencyLabel) return
                const fallbackFrequency: LoanCatalogItemDto = {
                  id: paymentFrequencyId,
                  code: '',
                  name: display.paymentFrequencyLabel,
                  description: null,
                  sortOrder: 0,
                  isActive: true,
                }
                setSuggestedFrequencyOption({
                  value: fallbackFrequency.id,
                  label: fallbackFrequency.name,
                  meta: fallbackFrequency,
                })
                setValue('suggestedPaymentFrequencyId', fallbackFrequency.id, { shouldValidate: true })
              })
            })
            .finally(() => {
              setProductDisplayLoading(false)
            })
          setProductPickerOpen(false)
        }}
        onClose={() => setProductPickerOpen(false)}
      />

      <LoanApplicationPaymentFrequencyPickerModal
        open={requestedFrequencyPickerOpen}
        frequencies={requestedFrequencyRows}
        search={requestedFrequencySearch}
        isLoading={requestedFrequencyRowsLoading}
        error={requestedFrequencyRowsError}
        selectedFrequencyId={requestedFrequencyOption?.value}
        onSearchChange={setRequestedFrequencySearch}
        onSelect={(frequency) => {
          setRequestedFrequencyOption({
            value: frequency.id,
            label: frequency.name,
            meta: frequency,
          })
          setValue('requestedPaymentFrequencyId', frequency.id, { shouldValidate: true })
          setRequestedFrequencyPickerOpen(false)
        }}
        onClose={() => setRequestedFrequencyPickerOpen(false)}
      />

      <LoanApplicationPromoterPickerModal
        open={promoterPickerOpen}
        promoters={promoterRows}
        search={promoterSearch}
        isLoading={promoterRowsLoading}
        error={promoterRowsError}
        selectedPromoterId={promoterOption?.value}
        onSearchChange={setPromoterSearch}
        onSelect={(promoter) => {
          setPromoterOption({
            value: promoter.id,
            label: promoter.clientFullName ?? 'Promotor',
            meta: promoter,
          })
          setValue('promoterId', promoter.id, { shouldValidate: true })
          setPromoterPickerOpen(false)
        }}
        onClose={() => setPromoterPickerOpen(false)}
      />
    </>
  )
}

const normalizeSearch = (value: string) => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
  return normalized || undefined
}

const resolveMunicipalityLabel = (
  client: ClientListItem,
  municipalityNameById: Record<string, string>,
) =>
  client.municipioNombre ||
  (client.municipioId ? municipalityNameById[client.municipioId] ?? '—' : '—')
