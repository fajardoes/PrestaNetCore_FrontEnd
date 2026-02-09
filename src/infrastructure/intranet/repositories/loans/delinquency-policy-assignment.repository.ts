import { prestanetApi } from '@/infrastructure/api/prestanet-api'
import type { GetDelinquencyPolicyAssignmentsRequestDto } from '@/infrastructure/intranet/requests/loans/get-delinquency-policy-assignments.request'
import type { CreateDelinquencyPolicyAssignmentRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy-assignment.request'
import type { UpdateDelinquencyPolicyAssignmentRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-assignment.request'
import type { UpdateDelinquencyPolicyAssignmentStatusRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-assignment-status.request'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'

const basePath = '/loans/delinquency-policy-assignments'

export class DelinquencyPolicyAssignmentRepository {
  async list(
    query: GetDelinquencyPolicyAssignmentsRequestDto,
  ): Promise<DelinquencyPolicyAssignmentListItemDto[]> {
    const { data } = await prestanetApi.get<DelinquencyPolicyAssignmentListItemDto[]>(
      basePath,
      { params: query },
    )
    return data
  }

  async create(
    payload: CreateDelinquencyPolicyAssignmentRequestDto,
  ): Promise<{ id: string } | DelinquencyPolicyAssignmentListItemDto> {
    const { data } = await prestanetApi.post<
      { id: string } | DelinquencyPolicyAssignmentListItemDto
    >(basePath, payload)
    return data
  }

  async update(
    id: string,
    payload: UpdateDelinquencyPolicyAssignmentRequestDto,
  ): Promise<void> {
    await prestanetApi.put(`${basePath}/${id}`, payload)
  }

  async updateStatus(
    id: string,
    payload: UpdateDelinquencyPolicyAssignmentStatusRequestDto,
  ): Promise<void> {
    await prestanetApi.patch(`${basePath}/${id}/status`, payload)
  }
}
