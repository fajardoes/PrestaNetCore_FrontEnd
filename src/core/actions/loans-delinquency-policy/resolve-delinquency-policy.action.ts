import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { ResolveDelinquencyPolicyRequestDto } from '@/infrastructure/intranet/requests/loans/resolve-delinquency-policy.request'
import type { ResolveDelinquencyPolicyResponseDto } from '@/infrastructure/intranet/responses/loans/resolve-delinquency-policy.response'
import { DelinquencyPolicyRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy.repository'

export class ResolveDelinquencyPolicyAction {
  private repository: DelinquencyPolicyRepository

  constructor(repository: DelinquencyPolicyRepository) {
    this.repository = repository
  }

  async execute(
    payload: ResolveDelinquencyPolicyRequestDto,
  ): Promise<ApiResult<ResolveDelinquencyPolicyResponseDto>> {
    try {
      const data = await this.repository.resolve(payload)
      return { success: true, data }
    } catch (error) {
      return toApiError(
        error,
        'No fue posible resolver la política efectiva de mora.',
      )
    }
  }
}

const repository = new DelinquencyPolicyRepository()
const action = new ResolveDelinquencyPolicyAction(repository)

export const resolveDelinquencyPolicyAction = (
  payload: ResolveDelinquencyPolicyRequestDto,
) => action.execute(payload)
