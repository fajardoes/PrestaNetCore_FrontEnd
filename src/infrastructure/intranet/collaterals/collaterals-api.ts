import { prestanetApi } from '@/infrastructure/api/prestanet-api'
import type { CreateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/create-collateral-request'
import type { UpdateCollateralRequestDto } from '@/infrastructure/intranet/requests/collaterals/update-collateral-request'
import type { GetCollateralsRequestDto } from '@/infrastructure/intranet/requests/collaterals/get-collaterals-request'
import type { CollateralCatalogItemCreateRequestDto } from '@/infrastructure/intranet/requests/collaterals/collateral-catalog-item-create-request'
import type { CollateralCatalogItemUpdateRequestDto } from '@/infrastructure/intranet/requests/collaterals/collateral-catalog-item-update-request'
import type { PatchCollateralCatalogItemStatusRequestDto } from '@/infrastructure/intranet/requests/collaterals/patch-collateral-catalog-item-status-request'
import type { UploadCollateralDocumentRequestDto } from '@/infrastructure/intranet/requests/collaterals/upload-collateral-document-request'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import type { CollateralCatalogItemDto } from '@/infrastructure/intranet/responses/collaterals/collateral-catalog-item-dto'
import type { CollateralDocumentResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-document-response'
import type { PagedResultDto } from '@/infrastructure/intranet/responses/collaterals/paged-result'

const basePath = '/collaterals'

export class CollateralsApi {
  async getCollaterals(
    query: GetCollateralsRequestDto,
  ): Promise<PagedResultDto<CollateralResponseDto>> {
    const { data } = await prestanetApi.get<PagedResultDto<CollateralResponseDto>>(
      basePath,
      { params: query },
    )
    return data
  }

  async getCollateralById(id: string): Promise<CollateralResponseDto> {
    const { data } = await prestanetApi.get<CollateralResponseDto>(
      `${basePath}/${id}`,
    )
    return data
  }

  async createCollateral(
    payload: CreateCollateralRequestDto,
  ): Promise<CollateralResponseDto> {
    const { data } = await prestanetApi.post<CollateralResponseDto>(
      basePath,
      payload,
    )
    return data
  }

  async updateCollateral(
    id: string,
    payload: UpdateCollateralRequestDto,
  ): Promise<CollateralResponseDto> {
    const { data } = await prestanetApi.put<CollateralResponseDto>(
      `${basePath}/${id}`,
      payload,
    )
    return data
  }

  async getCollateralTypes(active?: boolean): Promise<CollateralCatalogItemDto[]> {
    const { data } = await prestanetApi.get<CollateralCatalogItemDto[]>(
      `${basePath}/catalogs/types`,
      {
        params: typeof active === 'boolean' ? { active } : undefined,
      },
    )
    return data
  }

  async getCollateralTypeById(id: string): Promise<CollateralCatalogItemDto> {
    const { data } = await prestanetApi.get<CollateralCatalogItemDto>(
      `${basePath}/catalogs/types/${id}`,
    )
    return data
  }

  async createCollateralType(
    payload: CollateralCatalogItemCreateRequestDto,
  ): Promise<CollateralCatalogItemDto> {
    const { data } = await prestanetApi.post<CollateralCatalogItemDto>(
      `${basePath}/catalogs/types`,
      payload,
    )
    return data
  }

  async updateCollateralType(
    id: string,
    payload: CollateralCatalogItemUpdateRequestDto,
  ): Promise<CollateralCatalogItemDto> {
    const { data } = await prestanetApi.put<CollateralCatalogItemDto>(
      `${basePath}/catalogs/types/${id}`,
      payload,
    )
    return data
  }

  async patchCollateralTypeStatus(
    id: string,
    payload: PatchCollateralCatalogItemStatusRequestDto,
  ): Promise<void> {
    await prestanetApi.patch(`${basePath}/catalogs/types/${id}/status`, payload)
  }

  async getCollateralStatuses(
    active?: boolean,
  ): Promise<CollateralCatalogItemDto[]> {
    const { data } = await prestanetApi.get<CollateralCatalogItemDto[]>(
      `${basePath}/catalogs/statuses`,
      {
        params: typeof active === 'boolean' ? { active } : undefined,
      },
    )
    return data
  }

  async getCollateralStatusById(id: string): Promise<CollateralCatalogItemDto> {
    const { data } = await prestanetApi.get<CollateralCatalogItemDto>(
      `${basePath}/catalogs/statuses/${id}`,
    )
    return data
  }

  async createCollateralStatus(
    payload: CollateralCatalogItemCreateRequestDto,
  ): Promise<CollateralCatalogItemDto> {
    const { data } = await prestanetApi.post<CollateralCatalogItemDto>(
      `${basePath}/catalogs/statuses`,
      payload,
    )
    return data
  }

  async updateCollateralStatus(
    id: string,
    payload: CollateralCatalogItemUpdateRequestDto,
  ): Promise<CollateralCatalogItemDto> {
    const { data } = await prestanetApi.put<CollateralCatalogItemDto>(
      `${basePath}/catalogs/statuses/${id}`,
      payload,
    )
    return data
  }

  async patchCollateralStatusStatus(
    id: string,
    payload: PatchCollateralCatalogItemStatusRequestDto,
  ): Promise<void> {
    await prestanetApi.patch(
      `${basePath}/catalogs/statuses/${id}/status`,
      payload,
    )
  }

  async getCollateralDocuments(
    collateralId: string,
  ): Promise<CollateralDocumentResponseDto[]> {
    const { data } = await prestanetApi.get<CollateralDocumentResponseDto[]>(
      `${basePath}/${collateralId}/documents`,
    )
    return data
  }

  async uploadCollateralDocument(
    collateralId: string,
    payload: UploadCollateralDocumentRequestDto,
  ): Promise<void> {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('documentType', payload.documentType)

    await prestanetApi.post(`${basePath}/${collateralId}/documents`, formData)
  }

  async deleteCollateralDocument(
    collateralId: string,
    documentId: string,
  ): Promise<void> {
    await prestanetApi.delete(
      `${basePath}/${collateralId}/documents/${documentId}`,
    )
  }
}
