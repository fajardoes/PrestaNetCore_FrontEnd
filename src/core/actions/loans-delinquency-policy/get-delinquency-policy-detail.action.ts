import { toApiError, type ApiResult } from '@/core/helpers/api-result'
import type { DelinquencyPolicyDetailDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-detail.response'
import { DelinquencyPolicyRepository } from '@/infrastructure/intranet/repositories/loans/delinquency-policy.repository'

export class GetDelinquencyPolicyDetailAction {
  private repository: DelinquencyPolicyRepository

  constructor(repository: DelinquencyPolicyRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<ApiResult<DelinquencyPolicyDetailDto>> {
    try {
      const data = await this.repository.getById(id)
      return { success: true, data }
    } catch (error) {
      return toApiError(error, 'No fue posible obtener la política de mora.')
    }
  }
}

const repository = new DelinquencyPolicyRepository()
const action = new GetDelinquencyPolicyDetailAction(repository)

export const getDelinquencyPolicyDetailAction = (id: string) =>
  action.execute(id)
