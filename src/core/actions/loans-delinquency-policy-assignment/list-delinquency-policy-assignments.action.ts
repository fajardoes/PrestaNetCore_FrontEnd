import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { GetDelinquencyPolicyAssignmentsRequestDto } from '@/infrastructure/intranet/requests/loans/get-delinquency-policy-assignments.request'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'
import { DelinquencyPolicyAssignmentRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy-assignment.repository'

export class ListDelinquencyPolicyAssignmentsAction {
  private repository: DelinquencyPolicyAssignmentRepository

  constructor(repository: DelinquencyPolicyAssignmentRepository) {
    this.repository = repository
  }

  async execute(
    query: GetDelinquencyPolicyAssignmentsRequestDto,
  ): Promise<ApiResult<DelinquencyPolicyAssignmentListItemDto[]>> {
    try {
      const data = await this.repository.list(query)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible cargar las asignaciones.')
    }
  }
}

const repository = new DelinquencyPolicyAssignmentRepository()
const action = new ListDelinquencyPolicyAssignmentsAction(repository)

export const listDelinquencyPolicyAssignmentsAction = (
  query: GetDelinquencyPolicyAssignmentsRequestDto,
) => action.execute(query)
