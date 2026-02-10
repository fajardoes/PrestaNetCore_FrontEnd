import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateDelinquencyPolicyAssignmentStatusRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-assignment-status.request'
import { DelinquencyPolicyAssignmentRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy-assignment.repository'

export class UpdateDelinquencyPolicyAssignmentStatusAction {
  private repository: DelinquencyPolicyAssignmentRepository

  constructor(repository: DelinquencyPolicyAssignmentRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    payload: UpdateDelinquencyPolicyAssignmentStatusRequestDto,
  ): Promise<ApiResult<void>> {
    try {
      await this.repository.updateStatus(id, payload)
      return { success: true, data: undefined }
    } catch (error) {
      return toApiError(error, 'No fue posible actualizar el estado.')
    }
  }
}

const repository = new DelinquencyPolicyAssignmentRepository()
const action = new UpdateDelinquencyPolicyAssignmentStatusAction(repository)

export const updateDelinquencyPolicyAssignmentStatusAction = (
  id: string,
  payload: UpdateDelinquencyPolicyAssignmentStatusRequestDto,
) => action.execute(id, payload)
