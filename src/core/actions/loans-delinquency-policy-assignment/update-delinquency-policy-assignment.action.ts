import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateDelinquencyPolicyAssignmentRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-assignment.request'
import { DelinquencyPolicyAssignmentRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy-assignment.repository'

export class UpdateDelinquencyPolicyAssignmentAction {
  private repository: DelinquencyPolicyAssignmentRepository

  constructor(repository: DelinquencyPolicyAssignmentRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    payload: UpdateDelinquencyPolicyAssignmentRequestDto,
  ): Promise<ApiResult<void>> {
    try {
      await this.repository.update(id, payload)
      return { success: true, data: undefined }
    } catch (error) {
      return toApiError(error, 'No fue posible actualizar la asignación.')
    }
  }
}

const repository = new DelinquencyPolicyAssignmentRepository()
const action = new UpdateDelinquencyPolicyAssignmentAction(repository)

export const updateDelinquencyPolicyAssignmentAction = (
  id: string,
  payload: UpdateDelinquencyPolicyAssignmentRequestDto,
) => action.execute(id, payload)
