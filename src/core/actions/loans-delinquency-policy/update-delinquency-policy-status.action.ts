import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateDelinquencyPolicyStatusRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy-status.request'
import { DelinquencyPolicyRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy.repository'

export class UpdateDelinquencyPolicyStatusAction {
  private repository: DelinquencyPolicyRepository

  constructor(repository: DelinquencyPolicyRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    payload: UpdateDelinquencyPolicyStatusRequestDto,
  ): Promise<ApiResult<void>> {
    try {
      await this.repository.updateStatus(id, payload)
      return { success: true, data: undefined }
    } catch (error) {
      return toApiError(error, 'No fue posible actualizar el estado.')
    }
  }
}

const repository = new DelinquencyPolicyRepository()
const action = new UpdateDelinquencyPolicyStatusAction(repository)

export const updateDelinquencyPolicyStatusAction = (
  id: string,
  payload: UpdateDelinquencyPolicyStatusRequestDto,
) => action.execute(id, payload)
