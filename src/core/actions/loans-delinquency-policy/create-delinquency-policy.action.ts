import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { CreateDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/create-delinquency-policy.request'
import type { DelinquencyPolicyDetailDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-detail.response'
import { DelinquencyPolicyRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy.repository'

export class CreateDelinquencyPolicyAction {
  private repository: DelinquencyPolicyRepository

  constructor(repository: DelinquencyPolicyRepository) {
    this.repository = repository
  }

  async execute(
    payload: CreateDelinquencyPolicyRequestDto,
  ): Promise<ApiResult<DelinquencyPolicyDetailDto>> {
    try {
      const data = await this.repository.create(payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible crear la política de mora.')
    }
  }
}

const repository = new DelinquencyPolicyRepository()
const action = new CreateDelinquencyPolicyAction(repository)

export const createDelinquencyPolicyAction = (
  payload: CreateDelinquencyPolicyRequestDto,
) => action.execute(payload)
