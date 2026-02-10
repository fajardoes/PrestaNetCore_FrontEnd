import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { UpdateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/update-delinquency-policy.request'
import type { DelinquencyPolicyDetailDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-detail.response'
import { DelinquencyPolicyRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy.repository'

export class UpdateDelinquencyPolicyAction {
  private repository: DelinquencyPolicyRepository

  constructor(repository: DelinquencyPolicyRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    payload: UpdateDelinquencyPolicyRequestDto,
  ): Promise<ApiResult<DelinquencyPolicyDetailDto>> {
    try {
      const data = await this.repository.update(id, payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible actualizar la política de mora.')
    }
  }
}

const repository = new DelinquencyPolicyRepository()
const action = new UpdateDelinquencyPolicyAction(repository)

export const updateDelinquencyPolicyAction = (
  id: string,
  payload: UpdateDelinquencyPolicyRequestDto,
) => action.execute(id, payload)
