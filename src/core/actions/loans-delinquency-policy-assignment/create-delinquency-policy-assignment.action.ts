import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CreateDelinquencyPolicyAssignmentRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy-assignment.request'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'
import { DelinquencyPolicyAssignmentRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy-assignment.repository'

export class CreateDelinquencyPolicyAssignmentAction {
  private repository: DelinquencyPolicyAssignmentRepository

  constructor(repository: DelinquencyPolicyAssignmentRepository) {
    this.repository = repository
  }

  async execute(
    payload: CreateDelinquencyPolicyAssignmentRequestDto,
  ): Promise<ApiResult<{ id: string } | DelinquencyPolicyAssignmentListItemDto>> {
    try {
      const data = await this.repository.create(payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible crear la asignación.')
    }
  }
}

const repository = new DelinquencyPolicyAssignmentRepository()
const action = new CreateDelinquencyPolicyAssignmentAction(repository)

export const createDelinquencyPolicyAssignmentAction = (
  payload: CreateDelinquencyPolicyAssignmentRequestDto,
) => action.execute(payload)
