import { useCallback, useMemo } from 'react'
import { getClientDetailAction } from '@/core/actions/clients/get-client-detail.action'
import { listClientsAction } from '@/core/actions/clients/list-clients.action'
import { getLoanProductAction } from '@/core/actions/loans/get-loan-product.action'
import { listLoanProductsAction } from '@/core/actions/loans/list-loan-products.action'
import { listLoanCatalogItemsAction } from '@/core/actions/loans/list-loan-catalog-items.action'
import { getPromoterAction } from '@/core/actions/sales-promoters/get-promoter-action'
import { listPromotersAction } from '@/core/actions/sales-promoters/list-promoters-action'
import { listCollateralsAction } from '@/core/actions/collaterals/list-collaterals-action'
import { listMunicipalitiesAction } from '@/core/actions/geography/list-municipalities.action'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { LoanProductListItemDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-list-item.dto'
import type { ClientDetail, ClientListItem } from '@/infrastructure/interfaces/clients/client'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import type { Municipality } from '@/infrastructure/interfaces/organization/geography'
import type { PromoterResponse } from '@/infrastructure/interfaces/sales/promoter'
import type { AsyncSelectOption } from '@/presentation/share/components/async-select'
import { useAuth } from '@/hooks/useAuth'
import type { PagedResult } from '@/types/pagination'

const minChars = (value: string, length = 2) => value.trim().length >= length

const mapClientOption = (client: ClientListItem): AsyncSelectOption<ClientListItem> => ({
  value: client.id,
  label: `${client.nombreCompleto}${client.identidad ? ` - ${formatHnIdentity(client.identidad)}` : ''}`,
  meta: client,
})

const mapClientDetailToListItem = (client: ClientDetail): ClientListItem => ({
  id: client.id,
  nombreCompleto: client.nombreCompleto,
  identidad: client.identidad,
  rtn: client.rtn,
  sectorId: null,
  sectorNombre: null,
  municipioId: client.municipioId ?? null,
  municipioNombre: client.municipioNombre ?? null,
  generoId: client.generoId ?? null,
  activo: client.activo,
  esEmpleado: client.esEmpleado,
})

const mapPromoterOption = (
  promoter: PromoterResponse,
): AsyncSelectOption<PromoterResponse> => ({
  value: promoter.id,
  label: promoter.clientFullName ?? 'Promotor',
  meta: promoter,
})

const mapLoanProductOption = (
  product: LoanProductListItemDto,
): AsyncSelectOption<LoanProductListItemDto> => ({
  value: product.id,
  label: `${product.code} - ${product.name}`,
  meta: product,
})

const mapFrequencyOption = (
  item: LoanCatalogItemDto,
): AsyncSelectOption<LoanCatalogItemDto> => ({
  value: item.id,
  label: item.name,
  meta: item,
})

const mapCollateralOption = (
  collateral: CollateralResponseDto,
): AsyncSelectOption<CollateralResponseDto> => ({
  value: collateral.id,
  label: `${collateral.referenceNo ?? collateral.collateralTypeName ?? 'Garantía'} - ${collateral.ownerClientFullName ?? collateral.ownerClientName ?? ''}`,
  meta: collateral,
})

const findCatalogLabel = (items: LoanCatalogItemDto[], id?: string | null) => {
  if (!id) return '—'
  const found = items.find((item) => item.id === id)
  if (!found) return id
  return `${found.code} - ${found.name}`
}

export const useLoanApplicationOptions = () => {
  const { user } = useAuth()
  const allowedOfficeIds = useMemo(() => {
    const ids = new Set<string>()
    const agencyId = user?.agencyId?.trim().toLowerCase()
    if (agencyId) {
      ids.add(agencyId)
    }

    for (const officeId of user?.queryOfficeIds ?? []) {
      const normalized = officeId.trim().toLowerCase()
      if (normalized) {
        ids.add(normalized)
      }
    }

    return ids
  }, [user?.agencyId, user?.queryOfficeIds])

  const filterPromotersByOffice = useCallback(
    (promoters: PromoterResponse[]) => {
      if (!allowedOfficeIds.size) return promoters
      return promoters.filter((promoter) => {
        const promoterOfficeId = promoter.agencyId?.trim().toLowerCase()
        if (!promoterOfficeId) return false
        return allowedOfficeIds.has(promoterOfficeId)
      })
    },
    [allowedOfficeIds],
  )

  const listAllPromoters = useCallback(async (search?: string) => {
    const pageSize = 100
    const maxPages = 10
    let skip = 0
    let totalCount = Number.POSITIVE_INFINITY
    const collected: PromoterResponse[] = []

    while (
      skip < totalCount &&
      skip / pageSize < maxPages
    ) {
      const result = await listPromotersAction({
        search: search?.trim() || undefined,
        active: true,
        skip,
        take: pageSize,
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      const items = result.data.items ?? []
      collected.push(...items)
      totalCount =
        typeof result.data.totalCount === 'number'
          ? result.data.totalCount
          : collected.length

      if (!items.length || items.length < pageSize) {
        break
      }

      skip += pageSize
    }

    return collected
  }, [])

  const listClients = useCallback(
    async ({
      pageNumber = 1,
      pageSize = 10,
      search,
      active = true,
    }: {
      pageNumber?: number
      pageSize?: number
      search?: string
      active?: boolean
    }): Promise<PagedResult<ClientListItem>> => {
      const result = await listClientsAction({
        pageNumber,
        pageSize,
        search: search?.trim() || undefined,
        activo: active,
        esEmpleado: false,
      }, { silent: true })

      if (result.success) {
        const fallbackTotalPages =
          typeof result.data.totalCount === 'number' && result.data.totalCount > 0
            ? Math.ceil(result.data.totalCount / pageSize)
            : 1

        return {
          ...result.data,
          totalPages:
            typeof result.data.totalPages === 'number' && Number.isFinite(result.data.totalPages)
              ? Math.max(1, result.data.totalPages)
              : Math.max(1, fallbackTotalPages),
        }
      }

      throw new Error(result.error)
    },
    [],
  )

  const searchClients = useCallback(async (input: string) => {
    if (!minChars(input)) return []
    const result = await listClientsAction({
      pageNumber: 1,
      pageSize: 20,
      search: input.trim(),
      activo: true,
      esEmpleado: false,
    }, { silent: true })
    if (!result.success) return []
    return result.data.items.map(mapClientOption)
  }, [])

  const findClientById = useCallback(async (clientId: string) => {
    if (!clientId) return null
    const detailResult = await getClientDetailAction(clientId)
    if (detailResult.success) {
      return mapClientOption(mapClientDetailToListItem(detailResult.data))
    }

    const listResult = await listClientsAction({
      pageNumber: 1,
      pageSize: 20,
      search: clientId,
      activo: true,
      esEmpleado: false,
    }, { silent: true })
    if (!listResult.success) return null
    const found = listResult.data.items.find((item) => item.id === clientId)
    return found ? mapClientOption(found) : null
  }, [])

  const searchPromoters = useCallback(async (input: string) => {
    if (!minChars(input)) return []
    const promoters = await listAllPromoters(input.trim())
    return filterPromotersByOffice(promoters).slice(0, 20).map(mapPromoterOption)
  }, [filterPromotersByOffice, listAllPromoters])

  const listPromoters = useCallback(async (search?: string) => {
    const promoters = await listAllPromoters(search)
    return filterPromotersByOffice(promoters)
  }, [filterPromotersByOffice, listAllPromoters])

  const findPromoterById = useCallback(async (promoterId: string) => {
    if (!promoterId) return null
    const result = await getPromoterAction(promoterId)
    if (!result.success) return null
    const [found] = filterPromotersByOffice([result.data])
    return found ? mapPromoterOption(found) : null
  }, [filterPromotersByOffice])

  const searchLoanProducts = useCallback(async (input: string) => {
    const result = await listLoanProductsAction({
      search: input.trim() || undefined,
      isActive: true,
    }, { silent: true })
    if (!result.success) return []
    return result.data.map(mapLoanProductOption)
  }, [])

  const listLoanProducts = useCallback(async (search?: string) => {
    const result = await listLoanProductsAction({
      search: search?.trim() || undefined,
      isActive: true,
    }, { silent: true })
    if (!result.success) throw new Error(result.error)
    return result.data
  }, [])

  const findLoanProductById = useCallback(async (loanProductId: string) => {
    if (!loanProductId) return null

    const detailResult = await getLoanProductAction(loanProductId, { silent: true })
    if (detailResult.success) {
      const detail = detailResult.data
      return mapLoanProductOption({
        id: detail.id,
        code: detail.code,
        name: detail.name,
        currencyCode: detail.currencyCode,
        minAmount: detail.minAmount,
        maxAmount: detail.maxAmount,
        minTerm: detail.minTerm,
        maxTerm: detail.maxTerm,
        termUnit: '',
        portfolioType: '',
        isActive: detail.isActive,
      })
    }

    const listResult = await listLoanProductsAction({
      search: loanProductId,
      isActive: true,
    }, { silent: true })
    if (!listResult.success) return null
    const found = listResult.data.find((item) => item.id === loanProductId)
    return found ? mapLoanProductOption(found) : null
  }, [])

  const getLoanProductDisplayInfo = useCallback(async (loanProductId: string) => {
    if (!loanProductId) return null

    const [
      detailResult,
      termUnitsResult,
      interestTypesResult,
      rateBasesResult,
      paymentFrequenciesResult,
    ] =
      await Promise.all([
        getLoanProductAction(loanProductId, { silent: true }),
        listLoanCatalogItemsAction('term-units', { isActive: true }, { silent: true }),
        listLoanCatalogItemsAction('interest-rate-types', { isActive: true }, { silent: true }),
        listLoanCatalogItemsAction('rate-bases', { isActive: true }, { silent: true }),
        listLoanCatalogItemsAction('payment-frequencies', { isActive: true }, { silent: true }),
      ])

    if (!detailResult.success) return null

    const termUnitLabel = termUnitsResult.success
      ? findCatalogLabel(termUnitsResult.data, detailResult.data.termUnitId)
      : detailResult.data.termUnitId
    const interestRateTypeLabel = interestTypesResult.success
      ? findCatalogLabel(interestTypesResult.data, detailResult.data.interestRateTypeId)
      : detailResult.data.interestRateTypeId
    const rateBaseLabel = rateBasesResult.success
      ? findCatalogLabel(rateBasesResult.data, detailResult.data.rateBaseId)
      : detailResult.data.rateBaseId
    const paymentFrequencyLabel = paymentFrequenciesResult.success
      ? findCatalogLabel(paymentFrequenciesResult.data, detailResult.data.paymentFrequencyId)
      : detailResult.data.paymentFrequencyId

    return {
      nominalRate: detailResult.data.nominalRate,
      termUnitLabel,
      interestRateTypeLabel,
      rateBaseLabel,
      paymentFrequencyId: detailResult.data.paymentFrequencyId,
      paymentFrequencyLabel,
    }
  }, [])

  const searchPaymentFrequencies = useCallback(async (input: string) => {
    const result = await listLoanCatalogItemsAction('payment-frequencies', {
      isActive: true,
      search: input.trim() || undefined,
    }, { silent: true })
    if (!result.success) return []
    return result.data.map(mapFrequencyOption)
  }, [])

  const listPaymentFrequencies = useCallback(async (search?: string) => {
    const result = await listLoanCatalogItemsAction('payment-frequencies', {
      isActive: true,
      search: search?.trim() || undefined,
    }, { silent: true })
    if (!result.success) throw new Error(result.error)
    return result.data
  }, [])

  const findPaymentFrequencyById = useCallback(async (frequencyId: string) => {
    if (!frequencyId) return null
    const result = await listLoanCatalogItemsAction('payment-frequencies', {
      isActive: true,
    }, { silent: true })
    if (!result.success) return null
    const found = result.data.find((item) => item.id === frequencyId)
    return found ? mapFrequencyOption(found) : null
  }, [])

  const searchCollaterals = useCallback(async (input: string, ownerClientId?: string) => {
    const result = await listCollateralsAction({
      ownerClientId: ownerClientId?.trim() || undefined,
      search: input.trim() || undefined,
      active: true,
      skip: 0,
      take: 20,
    })
    if (!result.success) return []
    return result.data.items
      .filter((item) => item.statusCode?.trim().toUpperCase() === 'AVAILABLE')
      .map(mapCollateralOption)
  }, [])

  const listMunicipalities = useCallback(async (): Promise<Municipality[]> => {
    const result = await listMunicipalitiesAction()
    if (!result.success) return []
    return result.data
  }, [])

  return {
    listClients,
    listMunicipalities,
    searchClients,
    findClientById,
    searchPromoters,
    listPromoters,
    findPromoterById,
    searchLoanProducts,
    listLoanProducts,
    findLoanProductById,
    getLoanProductDisplayInfo,
    searchPaymentFrequencies,
    listPaymentFrequencies,
    findPaymentFrequencyById,
    searchCollaterals,
  }
}
