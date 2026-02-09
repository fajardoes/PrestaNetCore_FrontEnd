import { prestanetApi } from '@/infrastructure/api/prestanet-api'
import type { GetDelinquencyPoliciesRequestDto } from '@/infrastructure/intranet/requests/loans/get-delinquency-policies.request'
import type { CreateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy.request'
import type { UpdateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy.request'
import type { UpdateDelinquencyPolicyStatusRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-status.request'
import type { ResolveDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/resolve-delinquency-policy.request'
import type { DelinquencyPolicyListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-list-item.response'
import type { DelinquencyPolicyDetailDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-detail.response'
import type { ResolveDelinquencyPolicyResponseDto } from '@/infrastructure/intranet/responses/loans/resolve-delinquency-policy.response'

const basePath = '/loans/delinquency-policies'

export class DelinquencyPolicyRepository {
  async list(
    query: GetDelinquencyPoliciesRequestDto,
  ): Promise<DelinquencyPolicyListItemDto[]> {
    const { data } = await prestanetApi.get<DelinquencyPolicyListItemDto[]>(
      basePath,
      { params: query },
    )
    return data
  }

  async getById(id: string): Promise<DelinquencyPolicyDetailDto> {
    const { data } = await prestanetApi.get<DelinquencyPolicyDetailDto>(
      `${basePath}/${id}`,
    )
    return data
  }

  async create(
    payload: CreateDelinquencyPolicyRequestDto,
  ): Promise<DelinquencyPolicyDetailDto> {
    const { data } = await prestanetApi.post<DelinquencyPolicyDetailDto>(
      basePath,
      payload,
    )
    return data
  }

  async update(
    id: string,
    payload: UpdateDelinquencyPolicyRequestDto,
  ): Promise<DelinquencyPolicyDetailDto> {
    const { data } = await prestanetApi.put<DelinquencyPolicyDetailDto>(
      `${basePath}/${id}`,
      payload,
    )
    return data
  }

  async updateStatus(
    id: string,
    payload: UpdateDelinquencyPolicyStatusRequestDto,
  ): Promise<void> {
    await prestanetApi.patch(`${basePath}/${id}/status`, payload)
  }

  async resolve(
    payload: ResolveDelinquencyPolicyRequestDto,
  ): Promise<ResolveDelinquencyPolicyResponseDto> {
    const { data } = await prestanetApi.post<ResolveDelinquencyPolicyResponseDto>(
      `${basePath}/resolve`,
      payload,
    )
    return data
  }
}
